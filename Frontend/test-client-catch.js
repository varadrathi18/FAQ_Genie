class APIError extends Error {
  constructor(message, status, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

try {
  throw new APIError("My secret message", 400, "BAD_REQUEST");
} catch (error) {
  if (error instanceof APIError) {
    console.log("instanceof works");
  } else {
    const msg = error instanceof Error ? error.message : String(error);
    const newErr = new APIError(msg, 0, 'NETWORK_ERROR');
    console.log("Transformed error:", newErr.message);
  }
}
