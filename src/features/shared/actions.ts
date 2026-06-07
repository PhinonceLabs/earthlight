export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export type ZodLikeError = {
  flatten: () => { fieldErrors: Record<string, string[]> };
};

export function validationError(message: string, error: ZodLikeError): ActionResult<never> {
  return {
    ok: false,
    message,
    fieldErrors: error.flatten().fieldErrors,
  };
}
