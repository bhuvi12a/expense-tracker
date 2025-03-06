import { NextRequest } from 'next/server'

declare module 'next/server' {
  interface RouteParams {
    params: Record<string, string>
  }

  export type RouteHandler = (
    request: NextRequest | Request,
    context: RouteParams
  ) => Promise<Response> | Response
} 