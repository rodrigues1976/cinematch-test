import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

interface GenreScore {
  genre: string
  score: number
  type: "preferred" | "neutral" | "rejected"
}

interface MovieRecommendation {
  movie: any
  finalScore: number
  genreScore: number
  globalRating: number
}

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const userRatings = await db.getUserRatings(userId)

    if (userRatings.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Minimum 5 ratings required for recommendations",
        },
        { status: 400 },
      )
    }

    const ratingsMap = userRatings.reduce(
      (acc, rating) => {
        acc[rating.movieId] = rating.rating
        return acc
      },
      {} as Record<number, number>,
    )

    const allMovies = await db.getMovies()

    const genreScores: Record<string, number> = {}

    Object.entries(ratingsMap).forEach(([movieId, rating]) => {
      const movie = allMovies.find((m) => m.id === Number(movieId))
      if (!movie) return

      const points = rating - 3

      movie.genres.forEach((genre) => {
        genreScores[genre] = (genreScores[genre] || 0) + points
      })
    })

    const genreClassification: GenreScore[] = Object.entries(genreScores).map(([genre, score]) => ({
      genre,
      score,
      type: score > 0 ? "preferred" : score < 0 ? "rejected" : "neutral",
    }))

    const allGenres = [...new Set(allMovies.flatMap((m) => m.genres))]
    allGenres.forEach((genre) => {
      if (!genreScores.hasOwnProperty(genre)) {
        genreClassification.push({ genre, score: 0, type: "neutral" })
      }
    })

    const unratedMovies = allMovies.filter((movie) => !ratingsMap[movie.id])

    const movieRecommendations: MovieRecommendation[] = unratedMovies.map((movie) => {
      const genreScore = Math.max(...movie.genres.map((genre) => genreScores[genre] || 0))

      const finalScore = genreScore * 0.7 + movie.globalRating * 0.3

      return {
        movie,
        finalScore,
        genreScore,
        globalRating: movie.globalRating,
      }
    })

    movieRecommendations.sort((a, b) => {
      if (Math.abs(a.finalScore - b.finalScore) < 0.001) {
        if (Math.abs(a.globalRating - b.globalRating) < 0.001) {
          return a.movie.id - b.movie.id
        }
        return b.globalRating - a.globalRating
      }
      return b.finalScore - a.finalScore
    })

    const selectedMovies: MovieRecommendation[] = []
    const genreCount: Record<string, number> = {}

    for (const recommendation of movieRecommendations) {
      if (selectedMovies.length >= 5) break

      const movieGenres = recommendation.movie.genres
      const primaryGenre = movieGenres[0]

      if ((genreCount[primaryGenre] || 0) < 3) {
        selectedMovies.push(recommendation)
        genreCount[primaryGenre] = (genreCount[primaryGenre] || 0) + 1
      }
    }

    if (selectedMovies.length === 4) {
      const neutralGenres = genreClassification.filter((g) => g.type === "neutral").map((g) => g.genre)

      const neutralMovie = movieRecommendations.find(
        (rec) => !selectedMovies.includes(rec) && rec.movie.genres.some((genre) => neutralGenres.includes(genre)),
      )

      if (neutralMovie) {
        selectedMovies[4] = neutralMovie
      } else if (selectedMovies.length < 5) {
        const nextBest = movieRecommendations.find((rec) => !selectedMovies.includes(rec))
        if (nextBest) selectedMovies.push(nextBest)
      }
    }

    const finalRecommendations = selectedMovies.slice(0, 5)

    return NextResponse.json(
      {
        success: true,
        data: {
          recommendations: finalRecommendations,
          genreClassification,
          genreScores,
          totalRatings: userRatings.length,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
