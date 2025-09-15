import { type NextRequest, NextResponse } from "next/server"
import { MOVIES } from "@/lib/movie-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movieId = Number.parseInt(params.id)

    if (isNaN(movieId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid movie ID",
        },
        { status: 400 },
      )
    }

    const movie = MOVIES.find((m) => m.id === movieId)

    if (!movie) {
      return NextResponse.json(
        {
          success: false,
          error: "Movie not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: movie,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching movie:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
