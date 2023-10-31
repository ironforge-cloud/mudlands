import test from 'node:test'
import assert from 'assert/strict'
import {
  FOO_PROGRAM,
  airdropFooAuth,
  configPaths,
  initIdl,
  parseWrites,
  setupAnchor,
  upgradeIdl,
} from './utils'
import path from 'path'
import { findIdls } from '../../../src/mudlands'
import { LOCALHOST } from '@metaplex-foundation/amman-client'
import spok from 'spok'

const rootDir = path.join(__dirname, '..')
const paths = configPaths(rootDir)

test('setup anchor', () => setupAnchor(paths))

test('airdrop', airdropFooAuth)

test('initially no idls', async () => {
  const idlWrites = await findIdls(FOO_PROGRAM, LOCALHOST)
  assert.equal(idlWrites.length, 0)
})

test('init idl', async () => {
  return initIdl(FOO_PROGRAM, 'minimal', '0.0.0', paths)
})

test('after init one idl', async (t) => {
  const idlWrites = await findIdls(FOO_PROGRAM, LOCALHOST)
  assert.equal(idlWrites.length, 1)

  spok(t, parseWrites(idlWrites), [
    { version: '0.0.0', name: 'foo', instructions: [] },
  ])
})

test('upgrade idl', () => {
  return upgradeIdl(FOO_PROGRAM, 'minimal', '0.0.1', paths)
})

test('after one upgrade two idls', async (t) => {
  const idlWrites = await findIdls(FOO_PROGRAM, LOCALHOST)
  assert.equal(idlWrites.length, 2)

  spok(t, parseWrites(idlWrites), [
    { version: '0.0.0', name: 'foo', instructions: [] },
    { version: '0.0.1', name: 'foo', instructions: [] },
  ])
})

test('upgrade idl again', () => {
  return upgradeIdl(FOO_PROGRAM, 'minimal', '0.1.0', paths)
})

test('after another upgrade three idls', async (t) => {
  const idlWrites = await findIdls(FOO_PROGRAM, LOCALHOST)
  assert.equal(idlWrites.length, 3)

  spok(t, parseWrites(idlWrites), [
    { version: '0.0.0', name: 'foo', instructions: [] },
    { version: '0.0.1', name: 'foo', instructions: [] },
    { version: '0.1.0', name: 'foo', instructions: [] },
  ])
})
