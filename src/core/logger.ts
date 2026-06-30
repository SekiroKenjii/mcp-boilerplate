import { destination, pino, type Logger } from 'pino';

import { env } from '../config/env.js';

/**
 * Structured logger writing to **stderr only**. stdout is reserved for the
 * stdio transport's JSON-RPC stream — writing logs there would corrupt it.
 */
function createLogger(): Logger {
  if (env.NODE_ENV === 'production') {
    // Plain JSON to file descriptor 2 (stderr).
    return pino({ level: env.LOG_LEVEL }, destination(2));
  }

  return pino({
    level: env.LOG_LEVEL,
    transport: {
      target: 'pino-pretty',
      options: {
        destination: 2,
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  });
}

export const logger: Logger = createLogger();
