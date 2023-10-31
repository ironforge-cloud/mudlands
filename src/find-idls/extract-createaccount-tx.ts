import { Meta, Transaction } from '../types'
import { ixDataMatchesDiscriminator } from '../utils'

const DISC = Buffer.from('40f4bc78a7e9690a', 'hex')

export type ExtractCreateAccountResult = {
  idl: string
  program: string
  slot: number
}

export async function extractCreateAccount(
  tx: Transaction,
  meta: Meta | undefined,
  programId: string,
  idlId: string,
  slot: number
): Promise<ExtractCreateAccountResult | null> {
  if (meta?.err != null) {
    throw new Error('Cannot handle transaction with error')
  }

  // 1. Headers
  const header = tx.message.header
  const headerMatches =
    header.numReadonlySignedAccounts === 0 &&
    header.numReadonlyUnsignedAccounts === 4 &&
    header.numRequiredSignatures === 1

  if (!headerMatches) return null

  // 2. Main Instruction
  const instructions = tx.message.instructions
  if (instructions.length !== 1) return null

  const ix = instructions[0]
  if (!ixDataMatchesDiscriminator(ix.data, DISC)) return null

  return { idl: idlId, program: programId, slot }
}
