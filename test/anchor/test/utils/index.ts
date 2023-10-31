export * from './amman'
export * from './anchor-tasks'
export * from './setup-anchor'

export function parseWrites(writes: { idl: Buffer }[]) {
  return writes
    .map((w) => JSON.parse(w.idl.toString()))
    .sort((a, b) => a.version.localeCompare(b.version))
}
