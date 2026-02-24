export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LoggerOptions {
  level?: LogLevel | undefined;
  service?: string | undefined;
  meta?: Record<string, unknown> | undefined;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service?: string | undefined;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(configured: LogLevel, current: LogLevel): boolean {
  return LOG_LEVELS[current] >= LOG_LEVELS[configured];
}

/**
 * Create a structured JSON logger with configurable level and service context.
 * Zero dependencies — uses console + JSON serialization.
 *
 * @example
 * ```ts
 * const logger = createLogger({ service: "auth-api", level: "info" });
 * logger.info("User logged in", { userId: "123" });
 * // → {"timestamp":"...","level":"info","message":"User logged in","service":"auth-api","userId":"123"}
 * ```
 */
export function createLogger(options: LoggerOptions = {}) {
  const { level = "info", service, meta = {} } = options;

  function log(
    logLevel: LogLevel,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    if (!shouldLog(level, logLevel)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      message,
      ...(service ? { service } : {}),
      ...meta,
      ...data,
    };

    const output = JSON.stringify(entry);

    switch (logLevel) {
      case "debug":
        console.debug(output);
        break;
      case "info":
        console.info(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "error":
        console.error(output);
        break;
    }
  }

  return {
    debug(message: string, data?: Record<string, unknown>) {
      log("debug", message, data);
    },
    info(message: string, data?: Record<string, unknown>) {
      log("info", message, data);
    },
    warn(message: string, data?: Record<string, unknown>) {
      log("warn", message, data);
    },
    error(message: string, data?: Record<string, unknown>) {
      log("error", message, data);
    },
  };
}
