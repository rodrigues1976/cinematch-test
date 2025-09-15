import { GET } from "@/app/api/users/[userId]/recommendations/route"
import { db } from "@/lib/database"
import { NextRequest } from "next/server"
import jest from "jest"

jest.mock("@/lib/database", () => ({
  db: {
    getUserRatings: jest.fn(),
    getMovies: jest.fn(),
  },
}))

const mockDb = db as jest.Mocked<typeof db>

describe("Recommendations API", () => {
  const mockMovies = [
    {
      id: 1,
      title: "Action Movie 1",
      genres: ["Action"],
      year: 2023,
      globalRating: 8.0,
      image_url: "/action1.jpg",
    },
    {
      id: 2,
      title: "Drama Movie 1",
      genres: ["Drama"],
      year: 2023,
      globalRating: 7.5,
      image_url: "/drama1.jpg",
    },
    {
      id: 3,
      title: "Action Movie 2",
      genres: ["Action"],
      year: 2022,
      globalRating: 7.8,
      image_url: "/action2.jpg",
    },
    {
      id: 4,
      title: "Comedy Movie 1",
      genres: ["Comedy"],
      year: 2023,
      globalRating: 6.5,
      image_url: "/comedy1.jpg",
    },
    {
      id: 5,
      title: "Horror Movie 1",
      genres: ["Horror"],
      year: 2023,
      globalRating: 7.0,
      image_url: "/horror1.jpg",
    },
    {
      id: 6,
      title: "Sci-Fi Movie 1",
      genres: ["Sci-Fi"],
      year: 2023,
      globalRating: 8.5,
      image_url: "/scifi1.jpg",
    },
    {
      id: 7,
      title: "Romance Movie 1",
      genres: ["Romance"],
      year: 2023,
      globalRating: 7.2,
      image_url: "/romance1.jpg",
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.getMovies.mockResolvedValue(mockMovies)
  })

  test("should reject users with less than 5 ratings", async () => {
    mockDb.getUserRatings.mockResolvedValue([
      { movieId: 1, rating: 4 },
      { movieId: 2, rating: 3 },
      { movieId: 3, rating: 5 },
    ])

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe("Minimum 5 ratings required for recommendations")
  })

  test("should generate recommendations for users with 5+ ratings", async () => {
    mockDb.getUserRatings.mockResolvedValue([
      { movieId: 1, rating: 5 },
      { movieId: 2, rating: 4 }, 
      { movieId: 3, rating: 5 }, 
      { movieId: 4, rating: 2 }, 
      { movieId: 5, rating: 1 }, 
    ])

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.recommendations).toHaveLength(2) 
    expect(data.data.totalRatings).toBe(5)
    expect(data.data.genreScores).toBeDefined()
    expect(data.data.genreClassification).toBeDefined()
  })

  test("should calculate genre scores correctly", async () => {
    mockDb.getUserRatings.mockResolvedValue([
      { movieId: 1, rating: 5 }, 
      { movieId: 2, rating: 4 }, 
      { movieId: 3, rating: 5 }, 
      { movieId: 4, rating: 2 }, 
      { movieId: 5, rating: 1 }, 
    ])

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    expect(data.data.genreScores.Action).toBe(4)
    expect(data.data.genreScores.Drama).toBe(1)
    expect(data.data.genreScores.Comedy).toBe(-1)
    expect(data.data.genreScores.Horror).toBe(-2)
  })

  test("should classify genres correctly", async () => {
    mockDb.getUserRatings.mockResolvedValue([
      { movieId: 1, rating: 5 }, 
      { movieId: 2, rating: 4 }, 
      { movieId: 4, rating: 2 }, 
      { movieId: 5, rating: 1 }, 
      { movieId: 6, rating: 3 }, 
    ])

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    const genreClassification = data.data.genreClassification

    const actionGenre = genreClassification.find((g) => g.genre === "Action")
    const dramaGenre = genreClassification.find((g) => g.genre === "Drama")
    const comedyGenre = genreClassification.find((g) => g.genre === "Comedy")
    const horrorGenre = genreClassification.find((g) => g.genre === "Horror")
    const scifiGenre = genreClassification.find((g) => g.genre === "Sci-Fi")

    expect(actionGenre.type).toBe("preferred")
    expect(dramaGenre.type).toBe("preferred")
    expect(comedyGenre.type).toBe("rejected")
    expect(horrorGenre.type).toBe("rejected")
    expect(scifiGenre.type).toBe("neutral")
  })

  test("should calculate final scores correctly (70% genre + 30% global rating)", async () => {
    mockDb.getUserRatings.mockResolvedValue([
      { movieId: 1, rating: 5 },
      { movieId: 2, rating: 4 },
      { movieId: 3, rating: 5 },
      { movieId: 4, rating: 2 },
      { movieId: 5, rating: 1 },
    ])

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    const recommendations = data.data.recommendations

    const scifiRec = recommendations.find((r) => r.movie.id === 6)
    expect(scifiRec.finalScore).toBeCloseTo(2.55, 2)

    const romanceRec = recommendations.find((r) => r.movie.id === 7)
    expect(romanceRec.finalScore).toBeCloseTo(2.16, 2)
  })

  test("should sort recommendations by final score descending", async () => {
    mockDb.getUserRatings.mockResolvedValue([
      { movieId: 1, rating: 5 },
      { movieId: 2, rating: 4 },
      { movieId: 3, rating: 5 },
      { movieId: 4, rating: 2 },
      { movieId: 5, rating: 1 },
    ])

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    const recommendations = data.data.recommendations

    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].finalScore).toBeGreaterThanOrEqual(recommendations[i + 1].finalScore)
    }
  })

  test("should handle tie-breaking correctly", async () => {
    const tieMovies = [
      {
        id: 1,
        title: "Movie A",
        genres: ["Action"],
        year: 2023,
        globalRating: 8.0,
        image_url: "/a.jpg",
      },
      {
        id: 2,
        title: "Movie B",
        genres: ["Action"],
        year: 2023,
        globalRating: 7.0,
        image_url: "/b.jpg",
      },
      {
        id: 3,
        title: "Movie C",
        genres: ["Drama"],
        year: 2023,
        globalRating: 8.0,
        image_url: "/c.jpg",
      },
    ]

    mockDb.getMovies.mockResolvedValue(tieMovies)
    mockDb.getUserRatings.mockResolvedValue([
      { movieId: 4, rating: 5 }, 
      { movieId: 5, rating: 4 },
      { movieId: 6, rating: 5 },
      { movieId: 7, rating: 3 },
      { movieId: 8, rating: 2 },
    ])

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    const recommendations = data.data.recommendations
    const actionCount = recommendations.filter((r) => r.movie.genres.includes("Action")).length

    expect(recommendations[0].movie.id).toBeLessThanOrEqual(recommendations[1]?.movie.id || Number.POSITIVE_INFINITY)
  })

  test("should limit genre diversity (max 3 movies per genre)", async () => {
    const manyActionMovies = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Action Movie ${i + 1}`,
      genres: ["Action"],
      year: 2023,
      globalRating: 8.0 + i * 0.1,
      image_url: `/action${i + 1}.jpg`,
    }))

    mockDb.getMovies.mockResolvedValue(manyActionMovies)
    mockDb.getUserRatings.mockResolvedValue([
      { movieId: 11, rating: 5 }, 
      { movieId: 12, rating: 4 },
      { movieId: 13, rating: 5 },
      { movieId: 14, rating: 3 },
      { movieId: 15, rating: 2 },
    ])

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    const recommendations = data.data.recommendations
    const actionCount = recommendations.filter((r) => r.movie.genres.includes("Action")).length

    expect(actionCount).toBeLessThanOrEqual(3)
  })

  test("should handle server errors gracefully", async () => {
    mockDb.getUserRatings.mockRejectedValue(new Error("Database error"))

    const request = new NextRequest("http://localhost/api/users/test-user/recommendations")
    const response = await GET(request, { params: { userId: "test-user" } })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe("Internal server error")
  })
})
