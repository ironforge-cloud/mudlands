import path from 'path'
import fs from 'fs/promises'
import { TransactionInfo } from '../types'

async function dumpTx(dirname: string, tx: TransactionInfo) {
  const sig = tx.transaction.signatures[0]
  const json = JSON.stringify(tx, null, 2)
  const filename = path.join(dirname, `${tx.slot}.${sig}.json`)

  return fs.writeFile(filename, json, 'utf8')
}

export async function dumpTxs(txs: TransactionInfo[]) {
  const dumpTxsSubdir = process.env.DUMP_TXS
  if (dumpTxsSubdir == null) return

  // NOTE: __dirname is broken when running with esr
  const dirname = path.join(process.cwd(), 'txs', dumpTxsSubdir)
  await fs.mkdir(dirname, { recursive: true })
  return Promise.all(txs.map((tx) => dumpTx(dirname, tx)))
}
