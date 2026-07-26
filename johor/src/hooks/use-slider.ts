import { useCallback, useState } from 'react'

type UseSliderOptions = {
  totalSlides: number
  initialIndex?: number
}

export type UseSliderReturn = {
  activeIndex: number
  goToSlide: (index: number) => void
  goPrev: () => void
  goNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
}

export function useSlider({
  totalSlides,
  initialIndex = 0,
}: UseSliderOptions): UseSliderReturn {
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, Math.min(initialIndex, totalSlides - 1))
  )

  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalSlides - 1))
      setActiveIndex(clamped)
    },
    [totalSlides]
  )

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(totalSlides - 1, prev + 1))
  }, [totalSlides])

  const canGoPrev = activeIndex > 0
  const canGoNext = activeIndex < totalSlides - 1

  return {
    activeIndex,
    goToSlide,
    goPrev,
    goNext,
    canGoPrev,
    canGoNext,
  }
}
