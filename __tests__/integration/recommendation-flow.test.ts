import { GET } from "@/app/api/users/[userId]/recommendations/route"
import { db } from "@/lib/database"
import { NextRequest } from "next/server"

describe("Recommendation Integration Flow", () => {
  beforeEach(async () => {
    const movies = [
      { title: "The Matrix", genres: ["Action", "Sci-Fi"], year: 1999, global_rating: 8.7, image_url: "/matrix.jpg" },
      { title: "Titanic", genres: ["Romance", "Drama"], year: 1997, global_rating: 7.9, image_url: "/titanic.jpg" },
      {
        title: "The Godfather",
        genres: ["Crime", "Drama"],
        year: 1972,
        global_rating: 9.2,
        image_url: "/godfather.jpg",
      },
      { title: "Pulp Fiction", genres: ["Crime", "Drama"], year: 1994, global_rating: 8.9, image_url: "/pulp.jpg" },
      {
        title: "Forrest Gump",
        genres: ["Drama", "Romance"],
        year: 1994,
        global_rating: 8.8,
        image_url: "/forrest.jpg",
      },
      {
        title: "The Dark Knight",
        genres: ["Action", "Crime"],
        year: 2008,
        global_rating: 9.0,
        image_url: "/batman.jpg",
      },
      { title: "Inception", genres: ["Action", "Sci-Fi"], year: 2010, global_rating: 8.8, image_url: "/inception.jpg" },
      {
        title: "The Shawshank Redemption",
        genres: ["Drama"],
        year: 1994,
        global_rating: 9.3,
        image_url: "/shawshank.jpg",
      },
    ]

    for (const movie of movies) {
      await db.insertMovie(movie)
    }
  })

  test("should provide complete recommendation flow for action movie lover", async () => {
    const userId = "action-lover"

    await db.upsertUserRating(userId, 1, 5) 
    await db.upsertUserRating(userId, 2, 2) 
    await db.upsertUserRating(userId, 6, 5) 
    await db.upsertUserRating(userId, 7, 5) 
    await db.upsertUserRating(userId, 3, 4) 

    const request = new NextRequest(`http://localhost/api/users/${userId}/recommendations`)
    const response = await GET(request, { params: { userId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    const genreClassification = data.data.genreClassification
    const actionGenre = genreClassification.find((g) => g.genre === "Action")
    const scifiGenre = genreClassification.find((g) => g.genre === "Sci-Fi")
    const romanceGenre = genreClassification.find((g) => g.genre === "Romance")

    expect(actionGenre.type).toBe("preferred")
    expect(scifiGenre.type).toBe("preferred")
    expect(romanceGenre.type).toBe("rejected")

    const recommendations = data.data.recommendations
    const hasActionOrSciFi = recommendations.some(
      (r) => r.movie.genres.includes("Action") || r.movie.genres.includes("Sci-Fi"),
    )
    expect(hasActionOrSciFi).toBe(true)
  })

  test("should handle edge case with exactly 5 ratings", async () => {
    const userId = "edge-case-user"

    await db.upsertUserRating(userId, 1, 4)
    await db.upsertUserRating(userId, 2, 3)
    await db.upsertUserRating(userId, 3, 5)
    await db.upsertUserRating(userId, 4, 2)
    await db.upsertUserRating(userId, 5, 4)

    const request = new NextRequest(`http://localhost/api/users/${userId}/recommendations`)
    const response = await GET(request, { params: { userId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.totalRatings).toBe(5)
    expect(data.data.recommendations.length).toBeGreaterThan(0)
  })
})
