"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRate: (rating: number) => void
  onRemove: () => void
  size?: "sm" | "md" | "lg"
}

export function StarRating({ rating, onRate, onRemove, size = "sm" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const iconSize = sizeClasses[size]

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className="p-0.5 hover:scale-110 transition-transform"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onRate(star)}
          >
            <Star
              className={`${iconSize} transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-red-400" onClick={onRemove}>
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
