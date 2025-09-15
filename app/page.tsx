"use client"

import { useState, useEffect } from "react"
import { MovieCatalog } from "@/components/movie-catalog"
import { RecommendationEngine } from "@/components/recommendation-engine"
import { UserRatings } from "@/components/user-ratings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CineMatchPage() {
  const [userRatings, setUserRatings] = useState<Record<number, number>>({})
  const [showRecommendations, setShowRecommendations] = useState(false)

  useEffect(() => {
    const savedRatings = localStorage.getItem("cinematch-ratings")
    if (savedRatings) {
      setUserRatings(JSON.parse(savedRatings))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cinematch-ratings", JSON.stringify(userRatings))
  }, [userRatings])

  const handleRating = (movieId: number, rating: number) => {
    setUserRatings((prev) => ({
      ...prev,
      [movieId]: rating,
    }))
  }

  const handleRemoveRating = (movieId: number) => {
    setUserRatings((prev) => {
      const newRatings = { ...prev }
      delete newRatings[movieId]
      return newRatings
    })
  }

  const ratingCount = Object.keys(userRatings).length
  const canShowRecommendations = ratingCount >= 5

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">CineMatch</h1>
              <p className="text-purple-200">Sistema de Recomendação de Filmes</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-200 border-purple-400/30">
                {ratingCount} avaliações
              </Badge>
              {canShowRecommendations && (
                <Button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {showRecommendations ? "Ver Catálogo" : "Ver Recomendações"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showRecommendations ? (
          <div className="space-y-8">
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Suas Recomendações Personalizadas</CardTitle>
                <p className="text-purple-200">
                  Baseado em suas {ratingCount} avaliações, selecionamos estes filmes para você
                </p>
              </CardHeader>
              <CardContent>
                <RecommendationEngine
                  userRatings={userRatings}
                  onRate={handleRating}
                  onRemoveRating={handleRemoveRating}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {}
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-white mb-2">Como funciona o CineMatch?</h2>
                  <p className="text-purple-200 mb-4">
                    Avalie pelo menos 5 filmes para receber recomendações personalizadas baseadas em seus gostos
                  </p>
                  <div className="flex justify-center">
                    <Badge
                      variant={canShowRecommendations ? "default" : "secondary"}
                      className={
                        canShowRecommendations
                          ? "bg-green-600 text-white"
                          : "bg-orange-600/20 text-orange-200 border-orange-400/30"
                      }
                    >
                      {canShowRecommendations
                        ? "✓ Pronto para recomendações!"
                        : `${ratingCount}/5 avaliações necessárias`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {}
            {ratingCount > 0 && <UserRatings userRatings={userRatings} onRemoveRating={handleRemoveRating} />}

            {}
            <MovieCatalog userRatings={userRatings} onRate={handleRating} onRemoveRating={handleRemoveRating} />
          </div>
        )}
      </main>
    </div>
  )
}
