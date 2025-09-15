"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { MOVIES } from "@/lib/movie-data"

interface MovieCatalogProps {
  userRatings: Record<number, number>
  onRate: (movieId: number, rating: number) => void
  onRemoveRating: (movieId: number) => void
}

export function MovieCatalog({ userRatings, onRate, onRemoveRating }: MovieCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")

  const genres = useMemo(() => {
    const allGenres = MOVIES.flatMap((movie) => movie.genres)
    return [...new Set(allGenres)].sort()
  }, [])

  const years = useMemo(() => {
    const allYears = MOVIES.map((movie) => movie.year)
    return [...new Set(allYears)].sort((a, b) => b - a)
  }, [])

  const filteredMovies = useMemo(() => {
    return MOVIES.filter((movie) => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGenre = selectedGenre === "all" || movie.genres.includes(selectedGenre)
      const matchesYear = selectedYear === "all" || movie.year.toString() === selectedYear

      return matchesSearch && matchesGenre && matchesYear
    })
  }, [searchTerm, selectedGenre, selectedYear])

  return (
    <div className="space-y-6">
      {}
      <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Buscar por título</label>
              <Input
                placeholder="Digite o nome do filme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border-purple-400/30 text-white placeholder:text-purple-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Filtrar por gênero</label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="bg-black/20 border-purple-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-400/30">
                  <SelectItem value="all">Todos os gêneros</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-purple-200 mb-2 block">Filtrar por ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-black/20 border-purple-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-400/30">
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
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
                  <div className="font-semibold">{movie.title}</div>
                </div>
              </div>

              <div className="space-y-3">
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

                <div className="flex items-center justify-between">
                  <div className="text-sm text-purple-200">⭐ {movie.globalRating.toFixed(1)}</div>
                  <StarRating
                    rating={userRatings[movie.id] || 0}
                    onRate={(rating) => onRate(movie.id, rating)}
                    onRemove={() => onRemoveRating(movie.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center text-purple-200">
              <div className="text-4xl mb-4">🔍</div>
              <p>Nenhum filme encontrado com os filtros aplicados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
