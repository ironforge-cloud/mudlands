import { PublicKey } from './publickey'

const ANCHOR_SEED = 'anchor:idl'
export function idlAddrForProgram(programId: string) {
  const programPk = new PublicKey(programId)
  const [base, _] = PublicKey.findProgramAddressSync([], programPk)
  return PublicKey.createWithSeed(base, ANCHOR_SEED, programPk)
}
