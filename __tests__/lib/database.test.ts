import { db } from "@/lib/database"
import { existsSync, unlinkSync } from "fs"
import { join } from "path"

describe("Database Layer", () => {
  const testDataDir = join(process.cwd(), "data")

  beforeEach(() => {
    const files = ["movies.json", "user_ratings.json", "users.json"]
    files.forEach((file) => {
      const filePath = join(testDataDir, file)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
    })
  })

  describe("Movies Operations", () => {
    test("should insert and retrieve movies", async () => {
      const movieData = {
        title: "Test Movie",
        genres: ["Action", "Drama"],
        year: 2023,
        global_rating: 8.5,
        image_url: "/test-poster.jpg",
      }

      const insertedMovie = await db.insertMovie(movieData)
      expect(insertedMovie.id).toBeDefined()
      expect(insertedMovie.title).toBe(movieData.title)
      expect(insertedMovie.genres).toEqual(movieData.genres)

      const retrievedMovie = await db.selectMovieById(insertedMovie.id)
      expect(retrievedMovie).toEqual(insertedMovie)
    })

    test("should filter movies by genre", async () => {
      await db.insertMovie({
        title: "Action Movie",
        genres: ["Action"],
        year: 2023,
        global_rating: 7.0,
        image_url: "/action.jpg",
      })

      await db.insertMovie({
        title: "Drama Movie",
        genres: ["Drama"],
        year: 2023,
        global_rating: 8.0,
        image_url: "/drama.jpg",
      })

      const actionMovies = await db.selectMovies({ genre: "Action" })
      expect(actionMovies).toHaveLength(1)
      expect(actionMovies[0].title).toBe("Action Movie")
    })
  })

  describe("User Ratings Operations", () => {
    test("should insert and retrieve user ratings", async () => {
      const userId = "test-user"
      const movieId = 1
      const rating = 4

      const insertedRating = await db.upsertUserRating(userId, movieId, rating)
      expect(insertedRating.user_id).toBe(userId)
      expect(insertedRating.movie_id).toBe(movieId)
      expect(insertedRating.rating).toBe(rating)

      const userRatings = await db.selectUserRatings(userId)
      expect(userRatings).toHaveLength(1)
      expect(userRatings[0]).toEqual(insertedRating)
    })

    test("should update existing rating", async () => {
      const userId = "test-user"
      const movieId = 1

      await db.upsertUserRating(userId, movieId, 3)
      const updatedRating = await db.upsertUserRating(userId, movieId, 5)

      expect(updatedRating.rating).toBe(5)

      const userRatings = await db.selectUserRatings(userId)
      expect(userRatings).toHaveLength(1)
      expect(userRatings[0].rating).toBe(5)
    })

    test("should delete user rating", async () => {
      const userId = "test-user"
      const movieId = 1

      await db.upsertUserRating(userId, movieId, 4)
      const deleted = await db.deleteUserRating(userId, movieId)

      expect(deleted).toBe(true)

      const userRatings = await db.selectUserRatings(userId)
      expect(userRatings).toHaveLength(0)
    })
  })
})
