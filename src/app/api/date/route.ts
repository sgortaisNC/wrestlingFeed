import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const date = await prisma.options.findUnique({
      where: {
        key: "date"
      }
    });

    if (!date) {
      return NextResponse.json({ error: "Date non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ data: date });
  } catch (error) {
    console.error("Erreur lors de la récupération de la date:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la date" },
      { status: 500 }
    );
  }
} 