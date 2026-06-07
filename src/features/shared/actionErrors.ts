export function describeActionError(result: { message: string; fieldErrors?: Record<string, string[]> }): string {
  const fieldMessages = Object.entries(result.fieldErrors ?? {}).flatMap(([field, messages]) =>
    messages.map((message) => `${field}: ${message}`),
  );

  return [result.message, ...fieldMessages].join("\n");
}
