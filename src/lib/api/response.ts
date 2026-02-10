import { NextResponse } from "next/server";

export function success<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}

export function error(message: string, status = 500, code?: string) {
  return NextResponse.json(
    { error: { message, ...(code ? { code } : {}) } },
    { status }
  );
}
