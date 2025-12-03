// No-op stub for server-only packages
// This is used to stub out packages like pino and thread-stream on the client-side

const noop: any = () => noop

const logger = {
  info: noop,
  error: noop,
  warn: noop,
  debug: noop,
  trace: noop,
  fatal: noop,
  child: () => logger,
}

// Export for pino
export default () => logger

// Export levels for @walletconnect/logger
export const levels = {
  values: {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
  },
  labels: {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  },
}
