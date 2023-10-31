import { findIdls } from '../src/mudlands'

// Helper to log IDLs
function parseWrites(writes: { idl: Buffer }[]) {
  return writes.map((w) => JSON.parse(w.idl.toString()))
}

const PROGRAM_ID = process.argv[2]
if (PROGRAM_ID == null) {
  console.error('Usage: esr check-idl.ts <programId>')
  process.exit(1)
}

// May use different RPC provider to avoid getting rate limited
const SOLANA_MAINNET = 'https://api.mainnet-beta.solana.com'
const RPC = process.env.RPC ?? SOLANA_MAINNET

async function main() {
  console.error('Checking IDLs on RPC %s', RPC)
  const idlWrites = await findIdls(PROGRAM_ID, RPC)
  console.log(JSON.stringify(parseWrites(idlWrites), null, 2))
  console.log('Total of %d idls', idlWrites.length)
}

main()
  .then(() => process.exit(0))
  .catch((err: any) => {
    console.error(err)
    process.exit(1)
  })
