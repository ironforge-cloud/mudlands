import {
  IDL_SOURCE_ACCOUNT,
  IDL_SOURCE_INIT,
  IDL_SOURCE_UPGRADE,
  IdlSource,
  TransactionInfo,
} from '../types'
import { unzipIdlAccData } from '../unzip'
import { fetchAccount, fetchSigs, fetchTx, logDebug, logTrace } from '../utils'
import { dumpTxs } from '../utils/dump-txs'
import {
  extractCreateAccount,
  ExtractCreateAccountResult,
} from './extract-createaccount-tx'
import {
  deserializeWriteTxData,
  extractIdlWriteTxData,
} from './extract-idlwrite-tx'
import {
  extractSetBuffer,
  ExtractSetBufferResult,
} from './extract-setbuffer-tx'

type IdlWrite = {
  source: IdlSource
  startSlot: number
  endSlot: number
  writes: { slot: number; data: Buffer }[]
}

export type DeserializedIdlInfo = {
  source: IdlSource
  startSlot: number
  slot: number
  idl: Buffer
  addr: string
}

export class IdlFinder {
  readonly idlWriteTxs: (TransactionInfo & {
    idlData: Buffer
    tgtAddr: string
  })[] = []
  readonly idlCreateAccountInfos: (ExtractCreateAccountResult & {
    sigs: string[]
  })[] = []
  readonly idlSetBufferInfos: (ExtractSetBufferResult & {
    sigs: string[]
  })[] = []

  constructor(
    readonly progAddr: string,
    readonly idlAddr: string,
    readonly host: string
  ) {}

  async findIdls(): Promise<DeserializedIdlInfo[]> {
    const txIdls = await this.findIdlAccountTxs()
    if (txIdls.length > 0) return txIdls

    logDebug(
      `Unable to find transactions for IDL address '${this.idlAddr}', trying to load account data`
    )
    // If we didn't find any IDL via transactions it could be due to the
    // history of the RPC not reaching back far enough.
    // Therefore we try to load the IDL that currently stored in the IDL account
    const account = await fetchAccount(this.idlAddr, this.host)
    if (account == null) {
      logDebug(`Unable to find IDL at address '${this.idlAddr}'`)
      return []
    }
    const data = Buffer.from(account.data[0], 'base64')
    const unzipped = await unzipIdlAccData(data)

    // We set slots to 0 since we must assume that all accounts were written
    // while this IDL was in use
    const idlWrite: DeserializedIdlInfo = {
      source: IDL_SOURCE_ACCOUNT,
      startSlot: 0,
      slot: 0,
      idl: unzipped,
      addr: this.idlAddr,
    }
    return [idlWrite]
  }

  async findIdlAccountTxs(): Promise<DeserializedIdlInfo[]> {
    const txs = (
      await resolveTxsForAddress(this.idlAddr, 'IDL address', this.host)
    ).filter((tx) => tx.meta?.err == null)

    logDebug('Found %d transactions for IDL address', txs.length)
    if (logTrace.enabled) {
      const infos = txs.map((tx) => {
        return {
          slot: tx.slot,
          sig: tx.transaction.signatures[0],
        }
      })

      logTrace('Transactions %O', infos)
    }
    await dumpTxs(txs)

    // TODO(thlorenz):  we look at the same transaction multiple times as we
    // don't remove the ones that matched, we should improve on that

    // 1. IdlWrite Transactions
    await this.addIdlWritTxs(txs, this.idlAddr)

    // 2. CreateAccount Transactions
    {
      const infos = (
        await Promise.all(
          txs.map(async (tx) => {
            const data = await extractCreateAccount(
              tx.transaction,
              tx.meta,
              this.progAddr,
              this.idlAddr,
              tx.slot
            )
            if (data == null) return null
            return { ...data, slot: tx.slot, sigs: tx.transaction.signatures }
          })
        )
      ).filter((info) => info != null) as (ExtractCreateAccountResult & {
        slot: number
        sigs: string[]
      })[]

      infos.sort(sortBySlot)
      for (const info of infos) {
        this.idlCreateAccountInfos.push(info)
      }
    }

    // 3. SetBuffer Transactions
    {
      const infos = (
        await Promise.all(
          txs.map(async (tx) => {
            const data = await extractSetBuffer(
              tx.transaction,
              tx.meta,
              this.progAddr,
              this.idlAddr,
              tx.slot
            )
            if (data == null) return null
            return { ...data, slot: tx.slot, sigs: tx.transaction.signatures }
          })
        )
      ).filter((info) => info != null) as (ExtractSetBufferResult & {
        slot: number
        sigs: string[]
      })[]

      infos.sort(sortBySlot)
      for (const info of infos) {
        this.idlSetBufferInfos.push(info)
      }
    }

    // 4. IdlWrite Transactions for all the accounts that the IDL account was _set from_
    {
      for (const info of this.idlSetBufferInfos) {
        const txs = await resolveTxsForAddress(
          info.srcAddr,
          'SetBuffer source',
          this.host
        )
        await this.addIdlWritTxs(txs, info.srcAddr)
      }
    }

    logDebug(
      `IdlWrite: %d
CreateAccount: %d
SetBuffer: %d`,
      this.idlWriteTxs.length,
      this.idlCreateAccountInfos.length,
      this.idlSetBufferInfos.length
    )
    if (logTrace.enabled) {
      logTrace(this.toJSON())
    }

    // 5. Group IDLs and deserialize
    const grouped = this._groupIdlWrites()
    return this._deserializeIdlWrites(grouped)
  }

  private async _deserializeIdlWrites(
    grouped: Map<string, IdlWrite>
  ): Promise<DeserializedIdlInfo[]> {
    const idls = []
    for (const [addr, write] of grouped.entries()) {
      write.writes.sort(sortBySlot)
      const idl = await deserializeWriteTxData(write.writes.map((x) => x.data))
      if (idl != null) {
        idls.push({
          source: write.source,
          startSlot: write.startSlot,
          slot: write.endSlot,
          idl,
          addr,
        })
      }
    }
    idls.sort(sortBySlot)
    return idls
  }

  private _groupIdlWrites(): Map<string, IdlWrite> {
    const groupedIdlWrites = new Map<string, IdlWrite>()
    for (const tx of this.idlWriteTxs) {
      const source: IdlSource =
        tx.tgtAddr === this.idlAddr ? IDL_SOURCE_INIT : IDL_SOURCE_UPGRADE

      let startSlot = tx.slot
      let endSlot = tx.slot

      if (source === IDL_SOURCE_INIT) {
        const createInfo = this.idlCreateAccountInfos.find(
          (info) => info.idl === this.idlAddr
        )
        if (createInfo != null) {
          startSlot = createInfo.slot
        }
      }

      if (source === IDL_SOURCE_UPGRADE) {
        const setInfo = this.idlSetBufferInfos.find(
          (info) => info.srcAddr === tx.tgtAddr
        )
        if (setInfo != null) {
          endSlot = setInfo.slot
        }
      }

      const existed = groupedIdlWrites.has(tx.tgtAddr)
      const write = groupedIdlWrites.get(tx.tgtAddr) ?? {
        source,
        startSlot,
        endSlot,
        writes: [{ slot: tx.slot, data: tx.idlData }],
      }
      if (existed) {
        write.writes.push({ slot: tx.slot, data: tx.idlData })

        const start = Math.min(write.startSlot, startSlot)
        const end = Math.max(write.endSlot, endSlot)
        write.startSlot = start
        write.endSlot = end
      } else {
        groupedIdlWrites.set(tx.tgtAddr, write)
      }
    }

    return groupedIdlWrites
  }

  async addIdlWritTxs(txs: TransactionInfo[], tgtAddr: string) {
    const idlWriteTxs = (
      await Promise.all(
        txs.map(async (tx) => {
          const data = await extractIdlWriteTxData(
            tx.transaction,
            this.progAddr,
            tgtAddr
          )
          if (data == null) return null
          return { ...tx, idlData: data, tgtAddr }
        })
      )
    ).filter((tx) => tx != null) as (TransactionInfo & {
      idlData: Buffer
      tgtAddr: string
    })[]

    for (const tx of idlWriteTxs) {
      this.idlWriteTxs.push(tx)
    }
  }

  toJSON() {
    const idlWrites = this.idlWriteTxs.map((tx) => ({
      slot: tx.slot,
      bytes: tx.idlData.byteLength,
      sig: tx.transaction.signatures[0],
      tgtAddr: tx.tgtAddr,
    }))
    const createAccounts = this.idlCreateAccountInfos.map((info) => {
      const { sigs, ...rest } = info
      return {
        ...rest,
        sig: sigs[0],
      }
    })
    const setBuffers = this.idlSetBufferInfos.map((info) => {
      const { sigs, ...rest } = info
      return {
        ...rest,
        sig: sigs[0],
      }
    })
    return JSON.stringify({ idlWrites, createAccounts, setBuffers }, null, 2)
  }
}

function sortBySlot(a: { slot: number }, b: { slot: number }) {
  return a.slot - b.slot
}

async function resolveTxsForAddress(addr: string, label: string, host: string) {
  const sigs = await fetchSigs(addr, host)
  logTrace(
    `sigs for ${label} (${addr}):`,
    sigs.map((sig) => sig.signature).join('\n')
  )
  return Promise.all(sigs.map((sig) => fetchTx(sig.signature, host)))
}
