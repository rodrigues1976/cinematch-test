import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get("genre")
    const year = searchParams.get("year")
    const search = searchParams.get("search")

    const filters: any = {}

    if (genre && genre !== "all") {
      filters.genre = genre
    }

    if (year) {
      filters.year = Number.parseInt(year)
    }

    if (search) {
      filters.search = search
    }

    const movies = await db.getMovies(filters)

    return NextResponse.json(
      {
        success: true,
        data: movies,
        total: movies.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching movies:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
