import { unzip as unzipCb } from 'node:zlib'
import { promisify } from 'util'

export const unzip = promisify(unzipCb)

export function unzipIdlWriteInstructionAccData(buf: Buffer) {
  const offset = 13
  const zipped = buf.subarray(offset)
  return unzip(zipped)
}

export function unzipIdlAccData(buf: Buffer) {
  const offset = 44
  const zipped = buf.subarray(offset)
  return unzip(zipped)
}
