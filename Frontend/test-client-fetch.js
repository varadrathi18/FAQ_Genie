class APIError extends Error {
  constructor(message, status, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

async function request() {
  try {
    // Simulate frontend bug:
    throw new TypeError("Cannot read property 'body' of undefined");
  } catch (error) {
    throw new APIError(error instanceof Error ? error.message : String(error), 0, 'NETWORK_ERROR');
  }
}

request().catch(e => console.log("Final message:", e.message));
