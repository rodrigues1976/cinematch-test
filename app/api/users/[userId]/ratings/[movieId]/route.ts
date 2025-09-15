import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const RATINGS_FILE = path.join(process.cwd(), "data", "ratings.json")

interface UserRating {
  userId: string
  movieId: number
  rating: number
  timestamp: string
}

async function loadRatings(): Promise<UserRating[]> {
  try {
    const data = await fs.readFile(RATINGS_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveRatings(ratings: UserRating[]) {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
  await fs.writeFile(RATINGS_FILE, JSON.stringify(ratings, null, 2))
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string; movieId: string } }) {
  try {
    const { userId, movieId } = params
    const movieIdNum = Number.parseInt(movieId)

    if (isNaN(movieIdNum)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid movie ID",
        },
        { status: 400 },
      )
    }

    const ratings = await loadRatings()
    const filteredRatings = ratings.filter((r) => !(r.userId === userId && r.movieId === movieIdNum))

    if (filteredRatings.length === ratings.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating not found",
        },
        { status: 404 },
      )
    }

    await saveRatings(filteredRatings)

    return NextResponse.json(
      {
        success: true,
        message: "Rating removed successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error removing rating:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
