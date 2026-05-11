export function logError(label: string, error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(label, error);
  } else {
    console.error(
      label,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
