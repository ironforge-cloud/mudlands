import {
  rustbinMatch,
  confirmAutoMessageConsole,
} from '@metaplex-foundation/rustbin'
import path from 'path'

// __dirname + __filename only work from main script when using esbuild
export function configPaths(rootDir: string) {
  const cargoRootDir = path.join(rootDir, 'cargo')
  const cargoToml = path.join(rootDir, 'Cargo.toml')

  const anchor = path.join(cargoRootDir, 'bin', 'anchor')
  const fooWallet = path.join(rootDir, 'wallets', 'foo-auth.json')
  const idlsDir = path.join(rootDir, 'idls')

  return {
    cargoRootDir,
    cargoToml,
    anchor,
    fooWallet,
    idlsDir,
  }
}

export type Paths = ReturnType<typeof configPaths>

export async function setupAnchor(paths: Paths) {
  const config = {
    rootDir: paths.cargoRootDir,
    binaryName: 'anchor',
    binaryCrateName: 'anchor-cli',
    libName: 'anchor-lang',
    dryRun: false,
    cargoToml: paths.cargoToml,
  }

  const { fullPathToBinary } = await rustbinMatch(
    config,
    confirmAutoMessageConsole
  )
  console.log(`${fullPathToBinary} installed`)
}
