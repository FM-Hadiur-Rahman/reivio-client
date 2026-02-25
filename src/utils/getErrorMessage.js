export function getErrorMessage(err, fallback = "Request failed") {
  // Axios: server responded
  const data = err?.response?.data;

  // Common backend shapes:
  // { message: "..." }
  // { error: "..." }
  // { errors: [{ msg: "..." }, ...] } (express-validator)
  // { errors: { field: { message: "..." } } } (mongoose)
  // { details: [...] }
  if (typeof data === "string") return data;

  if (data?.message) return data.message;
  if (data?.error) return data.error;

  if (Array.isArray(data?.errors)) {
    // express-validator style
    const first = data.errors[0];
    if (typeof first === "string") return first;
    if (first?.msg) return first.msg;
    if (first?.message) return first.message;
  }

  if (data?.errors && typeof data.errors === "object") {
    // mongoose validation: errors[field].message
    const firstKey = Object.keys(data.errors)[0];
    const firstErr = data.errors[firstKey];
    if (firstErr?.message) return firstErr.message;
  }

  // Network error / CORS / timeout
  if (err?.message) return err.message;

  return fallback;
}
