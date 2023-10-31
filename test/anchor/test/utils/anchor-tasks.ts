import { Paths } from './setup-anchor'
import { tmpdir } from 'os'
import fs from 'fs'

export async function initIdl(
  programId: string,
  idlName: string,
  version: string,
  paths: Paths
) {
  const { execa } = await import('execa')
  const idlPath = versionIdl(idlName, version, paths)

  await execa(
    paths.anchor,
    [
      'idl',
      'init',
      '--provider.cluster=localnet',
      `--provider.wallet=${paths.fooWallet}`,
      '-f',
      idlPath,
      programId,
    ],
    { stdio: 'inherit' }
  )
}

export async function upgradeIdl(
  programId: string,
  idlName: string,
  version: string,
  paths: Paths
) {
  const { execa } = await import('execa')
  const idlPath = versionIdl(idlName, version, paths)

  await execa(
    paths.anchor,
    [
      'idl',
      'upgrade',
      '--provider.cluster=localnet',
      `--provider.wallet=${paths.fooWallet}`,
      '-f',
      idlPath,
      programId,
    ],
    { stdio: 'inherit' }
  )
}

function versionIdl(idlName: string, version: string, paths: Paths) {
  const idlTemplate = require(`${paths.idlsDir}/${idlName}.json`)
  const idl = { ...idlTemplate, version }
  const idlPath = tmpdir() + `/${idlName}.json`
  fs.writeFileSync(idlPath, JSON.stringify(idl), 'utf8')
  return idlPath
}
