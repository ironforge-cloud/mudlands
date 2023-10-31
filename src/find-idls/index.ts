/*
 * IDLs created two ways:
 *
 * ## Init (only first time):
 *
 *   1. IdlCreateAccount     create IDL account
 *      - accounts: [auth, idl, _, ?, prog]
 *   2. IdlWrite (1+)        write to IDL account
 *      - accounts: [auth, idl, prog]
 *
 *  ## Upgrade (each time the IDL is changed)
 *
 *   1. IdlCreateBuffer      create new account
 *      - accounts: [auth, new, _, _, prog]
 *   2. IdlWrite (1+)        to new account
 *      - accounts: [auth, new, prog]
 *   3. IdlSetBuffer         on IDL account
 *      - accounts: [auth, new, idl, prog]
 *
 *   prog: program id
 *   auth: IDL authority
 *   idl:  IDL account
 */

export * from './extract-createaccount-tx'
export * from './extract-idlwrite-tx'
export * from './extract-setbuffer-tx'
export { DeserializedIdlInfo } from './idl-finder'

import { idlAddrForProgram } from '../utils'
import { IdlFinder } from './idl-finder'

export async function findIdls(progAddr: string, host: string) {
  const idlAddr = await idlAddrForProgram(progAddr)
  const idlFinder = new IdlFinder(progAddr, idlAddr.toBase58(), host)
  return idlFinder.findIdls()
}
