import { Transaction } from '../types'
import { unzip } from '../unzip'
import { logError, logTrace } from '../utils'
import { decodeIxData, bufMatchesIxDiscriminator } from '../utils/ix-data'
import { matchingAccounts } from './accounts-match'

const DISC = Buffer.from('40f4bc78a7e9690a', 'hex')
const ZIP_MAGIC = Buffer.from('789c', 'hex')

/**
 * Extracts IdlWrite transaction data if it is adn IdlWrite Transaction.
 *
 * @param {Transaction} tx
 * @param {string} programId for which the IDL is written
 * @param {string} tgtAddr the account that the IDL is written to
 *   - for `init` this is the IDL address
 *   - for `upgrade` this is another address that will then be used in
 *     `SetBuffer` to update the IDL address itself
 * @returns {Buffer | null} the data of the IdlWrite instruction without the
 * instruction prefix
 */
export async function extractIdlWriteTxData(
  tx: Transaction,
  programId: string,
  tgtAddr: string
): Promise<Buffer | null> {
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

  /*
   * pub struct IdlAccounts<'info> {
   *     pub idl: Account<'info, IdlAccount>,
   *     pub authority: Signer<'info>,
   * }
   */
  const ix = instructions[0]
  const accountsByIdx = new Map([
    [0, tgtAddr],
    [2, programId],
  ])
  const accs = matchingAccounts(ix, tx.message.accountKeys, 2, accountsByIdx)
  if (accs == null) return null

  const buf = decodeIxData(ix.data)

  const discMatches = bufMatchesIxDiscriminator(buf, DISC)
  if (!discMatches) return null

  // Cut off instruction prefix
  return buf.subarray(13)
}

export function deserializeWriteTxData(data: Buffer[]) {
  const buf = Buffer.concat(data)
  if (logTrace.enabled) {
    logTrace(
      'Deserializing IDL data from %d buffers, total bytes: %d',
      data.length,
      buf.byteLength
    )
  }
  const hasZipMagicHeader = buf.subarray(0, 2).equals(ZIP_MAGIC)
  if (!hasZipMagicHeader) {
    logError('Failed to find magic ZIP header')
    return null
  }

  return unzip(buf)
}
