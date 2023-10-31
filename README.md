# Mudlands

Mu _ltiple_ _I_ dl and S _olana tooling_.

```ts
import { findIdls } from '@ironforge/mudlands'

// Helper to log IDLs
function parseWrites(writes: { idl: Buffer }[]) {
  return writes.map((w) => JSON.parse(w.idl.toString()))
}

// Find all IDLs created for CandyMachine
const CANDY_PROGRAM_ID = 'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'

// Should use different RPC provider to avoid getting rate limited
const SOLANA_MAINNET = 'https://api.mainnet-beta.solana.com'

const idlWrites = await findIdls(CANDY_PROGRAM_ID, SOLANA_MAINNET)
console.log(JSON.stringify(parseWrites(idlWrites), null, 2))
```

## Example

To try an example have a look at [`./examples/check-idl.ts`](./examples/check-idl.ts).

You can try it via `yarn ex:usd`, but replace `SOLANA_MAINNET` with an RPC node like helius
first, i.e.:

```sh
RPC=$HELIUS_MAIN yarn ex:usd
```

## LICENSE

MIT
