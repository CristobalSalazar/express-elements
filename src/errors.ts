import { Response } from "express";

export class Reply {
  constructor(private readonly res: Response) {}

  success(code: number, data?: any) {
    this.res.status(code).json({ ok: 1, data });
  }

  error(code: number, message?: string) {
    return this.res.status(code).json({
      error: { ok: 0, code, message },
    });
  }

  ok = (data?: any) => this.success(200, data);
  created = (data?: any) => this.success(201, data);
  badRequest = (message?: string) => this.error(400, message);
  unauthorized = (message?: string) => this.error(401, message);
  forbidden = (message?: string) => this.error(403, message);
  notFound = (message?: string) => this.error(404, message);
  methodNotAllowed = (message?: string) => this.error(405, message);
  conflict = (message?: string) => this.error(409, message);
  internal = (message?: string) => this.error(500, message);
}
