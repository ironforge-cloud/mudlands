import { Instruction } from '../types'

export function matchingAccounts(
  ix: Instruction,
  accountKeys: string[],
  totalAccounts: number,
  accountsByIndex: Map<number, string>,
  dump = false
) {
  if (accountKeys.length < totalAccounts) return null
  if (ix.accounts.length !== totalAccounts) return null

  const resolvedAccounts = new Array(ix.accounts.length)
  for (let i = 0; i < ix.accounts.length; i++) {
    const idx = ix.accounts[i]
    resolvedAccounts[i] = accountKeys[idx]
  }

  // If the programID was already mentioned in the ix.accounts
  // we don't need to add it again
  const programIdIndexInAccounts = ix.accounts.indexOf(ix.programIdIndex)
  if (programIdIndexInAccounts === -1) {
    resolvedAccounts.push(accountKeys[ix.programIdIndex])
  }
  if (dump) {
    console.log({ accountKeys, programIdIndexInAccounts })
    console.log({ ixAccount: ix.accounts })
    console.log({ resolvedAccounts })
  }

  for (const [idx, addr] of accountsByIndex.entries()) {
    if (idx >= totalAccounts) continue
    if (resolvedAccounts[idx] !== addr) return null
  }
  return resolvedAccounts
}
