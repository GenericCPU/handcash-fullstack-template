"use client"

import { useEffect, useRef } from "react"

interface MediaPreviewProps {
  imageUrl?: string
  multimediaUrl?: string
  className?: string
}

export function MediaPreview({ imageUrl, multimediaUrl, className = "" }: MediaPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (multimediaUrl && containerRef.current) {
      // Clear any existing content
      containerRef.current.innerHTML = ""

      // Create model-viewer element for GLB
      const modelViewer = document.createElement("model-viewer")
      modelViewer.setAttribute("src", multimediaUrl)
      modelViewer.setAttribute("alt", "3D Model")
      modelViewer.setAttribute("auto-rotate", "")
      modelViewer.setAttribute("camera-controls", "")
      modelViewer.setAttribute("style", "width: 100%; height: 100%; background-color: transparent;")
      modelViewer.setAttribute("shadow-intensity", "1")
      modelViewer.setAttribute("exposure", "1")

      containerRef.current.appendChild(modelViewer)

      // Load model-viewer script if not already loaded
      if (!document.querySelector('script[src*="model-viewer"]')) {
        const script = document.createElement("script")
        script.type = "module"
        script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
        document.head.appendChild(script)
      }
    }
  }, [multimediaUrl])

  if (multimediaUrl) {
    return (
      <div ref={containerRef} className={`${className} bg-muted/50 flex items-center justify-center`} style={{ minHeight: "200px" }}>
        <div className="text-muted-foreground text-sm">Loading 3D model...</div>
      </div>
    )
  }

  if (imageUrl) {
    return <img src={imageUrl} alt="Preview" className={className} />
  }

  return (
    <div className={`${className} bg-muted flex items-center justify-center`}>
      <span className="text-muted-foreground text-sm">No media</span>
    </div>
  )
}



