"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { MOVIES } from "@/lib/movie-data"

interface RecommendationEngineProps {
  userRatings: Record<number, number>
  onRate: (movieId: number, rating: number) => void
  onRemoveRating: (movieId: number) => void
}

interface GenreScore {
  genre: string
  score: number
  type: "preferred" | "neutral" | "rejected"
}

interface MovieRecommendation {
  movie: (typeof MOVIES)[0]
  finalScore: number
  genreScore: number
  globalRating: number
}

export function RecommendationEngine({ userRatings, onRate, onRemoveRating }: RecommendationEngineProps) {
  const recommendations = useMemo(() => {
    const genreScores: Record<string, number> = {}

    Object.entries(userRatings).forEach(([movieId, rating]) => {
      const movie = MOVIES.find((m) => m.id === Number.parseInt(movieId))
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

    const allGenres = [...new Set(MOVIES.flatMap((m) => m.genres))]
    allGenres.forEach((genre) => {
      if (!genreScores.hasOwnProperty(genre)) {
        genreClassification.push({ genre, score: 0, type: "neutral" })
      }
    })

    const unratedMovies = MOVIES.filter((movie) => !userRatings[movie.id])

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

    return {
      recommendations: selectedMovies.slice(0, 5),
      genreClassification,
      genreScores,
    }
  }, [userRatings])

  const { recommendations: finalRecommendations, genreClassification, genreScores } = recommendations

  return (
    <div className="space-y-6">
      {}
      <Card className="bg-purple-900/20 border-purple-400/30">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Análise dos seus gostos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-green-400 mb-2">Gêneros Preferidos (Score &gt; 0)</h4>
              <div className="space-y-1">
                {genreClassification
                  .filter((g) => g.type === "preferred")
                  .sort((a, b) => b.score - a.score)
                  .map((genre) => (
                    <div key={genre.genre} className="flex justify-between items-center">
                      <span className="text-green-200 text-sm">{genre.genre}</span>
                      <Badge className="bg-green-600/20 text-green-200 border-green-400/30">+{genre.score}</Badge>
                    </div>
                  ))}
                {genreClassification.filter((g) => g.type === "preferred").length === 0 && (
                  <p className="text-gray-400 text-sm">Nenhum gênero preferido ainda</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-blue-400 mb-2">Gêneros Neutros (Score = 0)</h4>
              <div className="space-y-1">
                {genreClassification
                  .filter((g) => g.type === "neutral")
                  .map((genre) => (
                    <div key={genre.genre} className="flex justify-between items-center">
                      <span className="text-blue-200 text-sm">{genre.genre}</span>
                      <Badge className="bg-blue-600/20 text-blue-200 border-blue-400/30">0</Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-red-400 mb-2">Gêneros Rejeitados (Score &lt; 0)</h4>
              <div className="space-y-1">
                {genreClassification
                  .filter((g) => g.type === "rejected")
                  .sort((a, b) => a.score - b.score)
                  .map((genre) => (
                    <div key={genre.genre} className="flex justify-between items-center">
                      <span className="text-red-200 text-sm">{genre.genre}</span>
                      <Badge className="bg-red-600/20 text-red-200 border-red-400/30">{genre.score}</Badge>
                    </div>
                  ))}
                {genreClassification.filter((g) => g.type === "rejected").length === 0 && (
                  <p className="text-gray-400 text-sm">Nenhum gênero rejeitado</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {finalRecommendations.map((rec, index) => {
          const movie = rec.movie
          const genreType = genreClassification.find((g) => movie.genres.includes(g.genre))?.type || "neutral"

          return (
            <Card
              key={movie.id}
              className="bg-black/40 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="aspect-[2/3] mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                  <img
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      target.nextElementSibling!.classList.remove("hidden")
                    }}
                  />
                  <div className="hidden text-white text-center p-4">
                    <div className="text-4xl mb-2">🎬</div>
                    <div className="font-semibold text-sm">{movie.title}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Badge className="bg-yellow-600/20 text-yellow-200 border-yellow-400/30 text-xs">
                      #{index + 1}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        genreType === "preferred"
                          ? "bg-green-600/20 text-green-200 border-green-400/30"
                          : genreType === "neutral"
                            ? "bg-blue-600/20 text-blue-200 border-blue-400/30"
                            : "bg-red-600/20 text-red-200 border-red-400/30"
                      }`}
                    >
                      {genreType === "preferred" ? "Preferido" : genreType === "neutral" ? "Neutro" : "Rejeitado"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white text-lg leading-tight mb-1">{movie.title}</h3>
                    <p className="text-purple-200 text-sm">{movie.year}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {movie.genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="text-xs bg-purple-600/20 text-purple-200 border-purple-400/30"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-200">Score Final:</span>
                      <span className="text-white font-mono">{rec.finalScore.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-200">Nota Global:</span>
                      <span className="text-white">⭐ {movie.globalRating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <StarRating
                      rating={0}
                      onRate={(rating) => onRate(movie.id, rating)}
                      onRemove={() => onRemoveRating(movie.id)}
                      size="md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {finalRecommendations.length === 0 && (
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center text-purple-200">
              <div className="text-4xl mb-4">🎬</div>
              <p>Não há filmes suficientes para gerar recomendações. Avalie mais filmes!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
