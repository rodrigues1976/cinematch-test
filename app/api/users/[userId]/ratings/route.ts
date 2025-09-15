import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const userRatings = await db.getUserRatings(userId)

    const ratingsMap = userRatings.reduce(
      (acc, rating) => {
        acc[rating.movieId] = rating.rating
        return acc
      },
      {} as Record<number, number>,
    )

    return NextResponse.json(
      {
        success: true,
        data: ratingsMap,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching user ratings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const body = await request.json()
    const { movieId, rating } = body

    // Validate input
    if (!movieId || typeof movieId !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid movie ID",
        },
        { status: 400 },
      )
    }

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating must be between 1 and 5",
        },
        { status: 400 },
      )
    }

    const newRating = await db.upsertUserRating(userId, movieId, rating)

    return NextResponse.json(
      {
        success: true,
        data: newRating,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error saving rating:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
