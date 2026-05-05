import { NextResponse } from "next/server";
import { getBoardHomeSlides } from "@/lib/board-home-data";

export async function GET() {
  try {
    const { pin } = await getBoardHomeSlides();
    return NextResponse.json({ pin });
  } catch {
    return NextResponse.json({ pin: null });
  }
}
