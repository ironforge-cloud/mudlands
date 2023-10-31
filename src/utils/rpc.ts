// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
import { TransactionInfo } from '../types'

declare global {
  // @ts-ignore (redeclare block-scoped var fetch)
  var fetch: any
}

const COMMITMENT = 'confirmed'
const STATUSES = ['confirmed', 'finalized', 'processed'] as const
export type ConfirmationStatus = (typeof STATUSES)[number]

// -----------------
// Fetch Signatures and Transactions
// -----------------
export type FetchSigsResult = {
  blockTime: number
  confirmationStatus: ConfirmationStatus
  err?: string
  memo?: string
  signature: string
  slot: number
}[]

export async function fetchSigs(
  addr: string,
  host: string
): Promise<FetchSigsResult> {
  const res = await fetch(host, {
    method: 'POST',
    headers: {
      ['Content-Type']: 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [addr, { commitment: COMMITMENT }],
    }),
  })

  if (!res.ok || res.status !== 200) {
    throw new Error(
      `Failed to fetch signatures for ${addr} (${res.statusText})`
    )
  }
  const body: any = await res.json()
  return body.result
}

export type FetchTxResult = TransactionInfo
export async function fetchTx(
  sig: string,
  host: string
): Promise<FetchTxResult> {
  const res = await fetch(host, {
    method: 'POST',
    headers: {
      ['Content-Type']: 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [sig, { commitment: COMMITMENT, encoding: 'json' }],
    }),
  })

  if (!res.ok || res.status !== 200) {
    throw new Error(
      `Failed to fetch transaction for ${sig} (${res.statusText})`
    )
  }
  const body: any = await res.json()
  return body.result
}

// -----------------
// Fetch IDL Account
// -----------------
export type AccountInfo = {
  lamports: number
  owner: string
  data: [string, 'base64']
  executable: boolean
  rentEpoch: number
  size: number
}
export async function fetchAccount(
  address: string,
  host: string
): Promise<AccountInfo | undefined> {
  const res = await fetch(host, {
    method: 'POST',
    headers: {
      ['Content-Type']: 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [address, { commitment: COMMITMENT, encoding: 'base64' }],
    }),
  })

  if (!res.ok || res.status !== 200) {
    throw new Error(
      `Failed to fetch account info for ${address} (${res.statusText})`
    )
  }
  const body: any = await res.json()
  return body.result.value
}
