import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export interface Movie {
  id: number
  title: string
  genres: string[]
  year: number
  global_rating: number
  image_url: string
  created_at?: string
  updated_at?: string
}

export interface UserRating {
  id?: number
  user_id: string
  movie_id: number
  rating: number
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  username?: string
  email?: string
  created_at?: string
  updated_at?: string
}

class PostgreSQLDatabase {
  private dataDir = join(process.cwd(), "data")

  constructor() {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true })
    }
  }

  private getTablePath(tableName: string): string {
    return join(this.dataDir, `${tableName}.json`)
  }

  private readTable<T>(tableName: string): T[] {
    const filePath = this.getTablePath(tableName)
    if (!existsSync(filePath)) {
      return []
    }
    try {
      const data = readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  private writeTable<T>(tableName: string, data: T[]): void {
    const filePath = this.getTablePath(tableName)
    writeFileSync(filePath, JSON.stringify(data, null, 2))
  }

  async selectMovies(where?: {
    genre?: string
    year?: number
    title_ilike?: string
  }): Promise<Movie[]> {
    let movies = this.readTable<Movie>("movies")

    if (where?.genre) {
      movies = movies.filter((movie) => movie.genres.some((g) => g.toLowerCase().includes(where.genre!.toLowerCase())))
    }

    if (where?.year) {
      movies = movies.filter((movie) => movie.year === where.year)
    }

    if (where?.title_ilike) {
      const searchTerm = where.title_ilike.toLowerCase()
      movies = movies.filter((movie) => movie.title.toLowerCase().includes(searchTerm))
    }

    return movies.sort((a, b) => a.id - b.id)
  }

  async selectMovieById(id: number): Promise<Movie | null> {
    const movies = this.readTable<Movie>("movies")
    return movies.find((movie) => movie.id === id) || null
  }

  async insertMovie(movie: Omit<Movie, "id" | "created_at" | "updated_at">): Promise<Movie> {
    const movies = this.readTable<Movie>("movies")
    const newId = Math.max(0, ...movies.map((m) => m.id)) + 1
    const now = new Date().toISOString()

    const newMovie: Movie = {
      ...movie,
      id: newId,
      created_at: now,
      updated_at: now,
    }

    movies.push(newMovie)
    this.writeTable("movies", movies)
    return newMovie
  }

  async selectUserRatings(userId: string): Promise<UserRating[]> {
    const ratings = this.readTable<UserRating>("user_ratings")
    return ratings.filter((rating) => rating.user_id === userId)
  }

  async selectUserRating(userId: string, movieId: number): Promise<UserRating | null> {
    const ratings = this.readTable<UserRating>("user_ratings")
    return ratings.find((rating) => rating.user_id === userId && rating.movie_id === movieId) || null
  }

  async upsertUserRating(userId: string, movieId: number, rating: number): Promise<UserRating> {
    const ratings = this.readTable<UserRating>("user_ratings")
    const existingIndex = ratings.findIndex((r) => r.user_id === userId && r.movie_id === movieId)

    const now = new Date().toISOString()

    if (existingIndex >= 0) {
      ratings[existingIndex] = {
        ...ratings[existingIndex],
        rating,
        updated_at: now,
      }
      this.writeTable("user_ratings", ratings)
      return ratings[existingIndex]
    } else {
      const newId = Math.max(0, ...ratings.map((r) => r.id || 0)) + 1
      const newRating: UserRating = {
        id: newId,
        user_id: userId,
        movie_id: movieId,
        rating,
        created_at: now,
        updated_at: now,
      }
      ratings.push(newRating)
      this.writeTable("user_ratings", ratings)
      return newRating
    }
  }

  async deleteUserRating(userId: string, movieId: number): Promise<boolean> {
    const ratings = this.readTable<UserRating>("user_ratings")
    const initialLength = ratings.length
    const filteredRatings = ratings.filter((rating) => !(rating.user_id === userId && rating.movie_id === movieId))

    if (filteredRatings.length < initialLength) {
      this.writeTable("user_ratings", filteredRatings)
      return true
    }
    return false
  }

  async selectUser(id: string): Promise<User | null> {
    const users = this.readTable<User>("users")
    return users.find((user) => user.id === id) || null
  }

  async insertUser(user: Omit<User, "created_at" | "updated_at">): Promise<User> {
    const users = this.readTable<User>("users")
    const now = new Date().toISOString()

    const newUser: User = {
      ...user,
      created_at: now,
      updated_at: now,
    }

    users.push(newUser)
    this.writeTable("users", users)
    return newUser
  }

  async selectMoviesWithUserRatings(userId: string): Promise<{
    movies: Movie[]
    userRatings: UserRating[]
  }> {
    const movies = await this.selectMovies()
    const userRatings = await this.selectUserRatings(userId)

    return { movies, userRatings }
  }

  async selectHealthStatus(): Promise<{ status: string; timestamp: string; connection: string }> {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      connection: "postgresql_simulation",
    }
  }
}

export const db = new PostgreSQLDatabase()

export class QueryBuilder {
  static movies() {
    return {
      select: (where?: { genre?: string; year?: number; title_ilike?: string }) => db.selectMovies(where),
      selectById: (id: number) => db.selectMovieById(id),
      insert: (movie: Omit<Movie, "id" | "created_at" | "updated_at">) => db.insertMovie(movie),
    }
  }

  static userRatings() {
    return {
      select: (userId: string) => db.selectUserRatings(userId),
      selectByUserAndMovie: (userId: string, movieId: number) => db.selectUserRating(userId, movieId),
      upsert: (userId: string, movieId: number, rating: number) => db.upsertUserRating(userId, movieId, rating),
      delete: (userId: string, movieId: number) => db.deleteUserRating(userId, movieId),
    }
  }

  static users() {
    return {
      selectById: (id: string) => db.selectUser(id),
      insert: (user: Omit<User, "created_at" | "updated_at">) => db.insertUser(user),
    }
  }
}
