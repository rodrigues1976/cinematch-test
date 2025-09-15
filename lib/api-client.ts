export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  total?: number
}

export interface Movie {
  id: number
  title: string
  genres: string[]
  year: number
  globalRating: number
  image: string
}

export interface UserRating {
  userId: string
  movieId: number
  rating: number
  timestamp: string
}

export interface RecommendationResponse {
  recommendations: Array<{
    movie: Movie
    finalScore: number
    genreScore: number
    globalRating: number
  }>
  genreClassification: Array<{
    genre: string
    score: number
    type: "preferred" | "neutral" | "rejected"
  }>
  genreScores: Record<string, number>
  totalRatings: number
}

class ApiClient {
  private baseUrl = "/api"

  async getMovies(filters?: {
    genre?: string
    year?: string
    search?: string
  }): Promise<ApiResponse<Movie[]>> {
    const params = new URLSearchParams()
    if (filters?.genre) params.append("genre", filters.genre)
    if (filters?.year) params.append("year", filters.year)
    if (filters?.search) params.append("search", filters.search)

    const response = await fetch(`${this.baseUrl}/movies?${params}`)
    return response.json()
  }

  async getMovie(id: number): Promise<ApiResponse<Movie>> {
    const response = await fetch(`${this.baseUrl}/movies/${id}`)
    return response.json()
  }

  async getUserRatings(userId: string): Promise<ApiResponse<Record<number, number>>> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/ratings`)
    return response.json()
  }

  async addRating(userId: string, movieId: number, rating: number): Promise<ApiResponse<UserRating>> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ movieId, rating }),
    })
    return response.json()
  }

  async removeRating(userId: string, movieId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/ratings/${movieId}`, {
      method: "DELETE",
    })
    return response.json()
  }

  async getRecommendations(userId: string): Promise<ApiResponse<RecommendationResponse>> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/recommendations`)
    return response.json()
  }
}

export const apiClient = new ApiClient()
