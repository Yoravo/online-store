type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, label: string, data?: unknown) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    label,
    ...(data !== undefined && {
      detail:
        data instanceof Error
          ? { message: data.message, stack: process.env.NODE_ENV === "development" ? data.stack : undefined }
          : data,
    }),
  };

  if (process.env.NODE_ENV === "development") {
    console[level](label, data);
  } else {
    // Structured JSON for log aggregators (Vercel, Axiom, Datadog)
    console[level](JSON.stringify(entry));
  }
}

export function logError(label: string, error: unknown) {
  log("error", label, error);
}

export function logWarn(label: string, data?: unknown) {
  log("warn", label, data);
}

export function logInfo(label: string, data?: unknown) {
  log("info", label, data);
}
