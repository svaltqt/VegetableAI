import { useEffect, useRef, useState } from "react"
import { Camera, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Tu navegador no soporta acceso a la cámara.")
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        })
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
      } catch (err) {
        setError(err.message || "No se pudo acceder a la cámara. Verifica los permisos.")
      }
    }
    start()
    return () => {
      isMounted = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const takePhoto = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `captura-${Date.now()}.jpg`, { type: "image/jpeg" })
        onCapture?.(file)
      },
      "image/jpeg",
      0.85
    )
  }

  return (
    <div className="rounded-xl overflow-hidden border bg-black/90 relative">
      {error ? (
        <div className="aspect-[4/3] flex flex-col items-center justify-center text-center p-6 text-white">
          <p className="font-medium">No se pudo abrir la cámara</p>
          <p className="text-sm text-white/70 mt-1">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={onCancel}>
            Volver
          </Button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full aspect-[4/3] object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="default"
              onClick={takePhoto}
              disabled={!ready}
              className="rounded-full h-14 w-14 p-0 ring-4 ring-white/20"
            >
              <Camera className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/10">
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
