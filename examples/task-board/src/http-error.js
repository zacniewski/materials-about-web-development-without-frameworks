export class HttpError extends Error {
  constructor(status, message, expose = status < 500) {
    super(message);
    this.status = status;
    this.expose = expose;
  }
}
