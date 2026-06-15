import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/cuenta/login", req.url), { status: 303 });
  res.cookies.delete("kmoda_session");
  res.cookies.delete("kmoda_customer");
  return res;
}
