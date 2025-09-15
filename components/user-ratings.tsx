"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { MOVIES } from "@/lib/movie-data"

interface UserRatingsProps {
  userRatings: Record<number, number>
  onRemoveRating: (movieId: number) => void
}

export function UserRatings({ userRatings, onRemoveRating }: UserRatingsProps) {
  const ratedMovies = Object.entries(userRatings)
    .map(([movieId, rating]) => {
      const movie = MOVIES.find((m) => m.id === Number.parseInt(movieId))
      return movie ? { ...movie, userRating: rating } : null
    })
    .filter(Boolean)

  if (ratedMovies.length === 0) return null

  return (
    <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Suas Avaliações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ratedMovies.map((movie) => (
            <div
              key={movie!.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-purple-900/20 border border-purple-500/20"
            >
              <div className="w-12 h-16 rounded bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-xs">
                🎬
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm truncate">{movie!.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-200 border-purple-400/30">
                    {movie!.genres[0]}
                  </Badge>
                  <StarRating
                    rating={movie!.userRating}
                    onRate={() => {}} 
                    onRemove={() => onRemoveRating(movie!.id)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
