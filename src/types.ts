export type Instruction = {
  accounts: number[]
  data: string
  programIdIndex: number
}

export type Message = {
  accountKeys: string[]
  header: {
    numReadonlySignedAccounts: number
    numReadonlyUnsignedAccounts: number
    numRequiredSignatures: number
  }
  instructions: Instruction[]
}

export type Transaction = {
  message: Message
  signatures: string[]
}

export type Meta = {
  computeUnitsConsumed: number
  err?: Record<string, any>
  fee: number
  innerInstructions: {
    index: number
    instructions: Instruction[]
  }[]
}

export type TransactionInfo = {
  transaction: Transaction
  slot: number
  blockTime: number
  meta?: Meta
}

/** Uploaded as part of initializing the IDL account (first upload) */
export const IDL_SOURCE_INIT = 'init'
/** Uploaded as part of updating the IDL account */
export const IDL_SOURCE_UPGRADE = 'upgrade'
/** Retrieved from the current IDL account data since no transactions were found */
export const IDL_SOURCE_ACCOUNT = 'account'
export const IDL_SOURCES = [
  IDL_SOURCE_INIT,
  IDL_SOURCE_UPGRADE,
  IDL_SOURCE_ACCOUNT,
] as const
/** The source of the IDL */
export type IdlSource = (typeof IDL_SOURCES)[number]
