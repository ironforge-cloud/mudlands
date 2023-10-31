import { Meta, Transaction } from '../types'
import { ixDataMatchesDiscriminator } from '../utils'
import { matchingAccounts } from './accounts-match'

const DISC = Buffer.from('40f4bc78a7e9690a', 'hex')

export type ExtractSetBufferResult = {
  idl: string
  program: string
  srcAddr: string
  slot: number
}

export async function extractSetBuffer(
  tx: Transaction,
  meta: Meta | undefined,
  programId: string,
  idlId: string,
  slot: number
): Promise<ExtractSetBufferResult | null> {
  if (meta?.err != null) {
    throw new Error('Cannot handle transaction with error')
  }

  // 1. Headers
  const header = tx.message.header
  const headerMatches =
    header.numReadonlySignedAccounts === 0 &&
    header.numReadonlyUnsignedAccounts === 1 &&
    header.numRequiredSignatures === 1

  if (!headerMatches) return null

  // 2. Main Instructions and Accounts
  const instructions = tx.message.instructions
  if (instructions.length !== 1) return null

  const ix = instructions[0]
  if (!ixDataMatchesDiscriminator(ix.data, DISC)) return null

  /*
   * pub struct IdlSetBuffer<'info> {
   *     // The buffer with the new idl data.
   *     pub buffer: Account<'info, IdlAccount>,
   *     // The idl account to be updated with the buffer's data.
   *     pub idl: Account<'info, IdlAccount>,
   *     // authority.key
   *     pub authority: Signer<'info>,
   * }
   */
  const accountsByIdx = new Map([
    [1, idlId],
    [3, programId],
  ])
  const accs = matchingAccounts(ix, tx.message.accountKeys, 3, accountsByIdx)
  if (accs == null) return null

  // 3. Inner Instructions
  const innerInstructions = meta?.innerInstructions
  if (innerInstructions != null && innerInstructions.length !== 0) return null

  return {
    idl: idlId,
    program: programId,
    srcAddr: accs[0],
    slot,
  }
}
