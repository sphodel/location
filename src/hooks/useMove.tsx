import { useEffect, useRef, useState } from "react";

const useMove=(initialPosition,upperBound,lowerBound)=>{
  const [dragging, setDragging] = useState(false)
  const [initialY, setInitialY] = useState(0)
  const [currentY, setCurrentY] = useState(initialPosition)
  const [translateY, setTranslateY] = useState(initialPosition)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        const newY = e.clientY - initialY + translateY
        if (newY >= upperBound && newY <= lowerBound) {
          setCurrentY(newY)
        }
      }
    }

    const handleMouseUp = () => {
      setDragging(false)
      const middlePoint = (upperBound + lowerBound) / 2
      if (currentY < middlePoint) {
        setCurrentY(upperBound)
        setTranslateY(upperBound)
      } else {
        setCurrentY(lowerBound)
        setTranslateY(lowerBound)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, initialY, currentY, translateY, upperBound, lowerBound])

  const handleMouseDown = (e) => {
    setDragging(true)
    setInitialY(e.clientY)
  }

  return [containerRef, handleMouseDown, currentY]
}
export default useMove
