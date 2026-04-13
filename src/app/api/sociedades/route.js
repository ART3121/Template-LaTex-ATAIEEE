import { NextResponse } from "next/server";

import { listarSociedades } from "../../../lib/ata";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ sociedades: listarSociedades() });
}
