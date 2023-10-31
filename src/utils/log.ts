import debug from 'debug'

export const logErrorDebug = debug('midl:error')
export const logInfoDebug = debug('midl:info')
export const logDebug = debug('midl:debug')
export const logTrace = debug('midl:trace')

export const logError = logErrorDebug.enabled
  ? logErrorDebug
  : console.error.bind(console)

export const logInfo = logInfoDebug.enabled
  ? logInfoDebug
  : console.log.bind(console)
