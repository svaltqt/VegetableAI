import { useEffect, useRef, useState } from "react"
import { Camera, X, Zap, ZapOff } from "lucide-react"
import { Button } from "@/components/ui/button"

// Región de interés (recorte) centrada: solo la zona de la fecha. Reduce el
// ruido de fondo (mesa, cocina) y mejora muchísimo la lectura del OCR.
const ROI_W = 0.9
const ROI_H = 0.5

export function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const trackRef = useRef(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchOn, setTorchOn] = useState(false)

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
        const track = stream.getVideoTracks()[0]
        trackRef.current = track
        const caps = track.getCapabilities?.()
        setTorchSupported(Boolean(caps && "torch" in caps))
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

  const toggleTorch = async () => {
    const track = trackRef.current
    if (!track) return
    try {
      const next = !torchOn
      await track.applyConstraints({ advanced: [{ torch: next }] })
      setTorchOn(next)
    } catch {
      setTorchSupported(false)
    }
  }

  const takePhoto = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const vw = video.videoWidth
    const vh = video.videoHeight

    // Recortamos el centro (ROI) del fotograma intrínseco.
    const cropW = Math.round(vw * ROI_W)
    const cropH = Math.round(vh * ROI_H)
    const sx = Math.round((vw - cropW) / 2)
    const sy = Math.round((vh - cropH) / 2)

    const canvas = document.createElement("canvas")
    canvas.width = cropW
    canvas.height = cropH
    canvas.getContext("2d").drawImage(video, sx, sy, cropW, cropH, 0, 0, cropW, cropH)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `captura-${Date.now()}.jpg`, { type: "image/jpeg" })
        onCapture?.(file)
      },
      "image/jpeg",
      0.92
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

          {/* Guía de encuadre (ROI): recuadro claro con el resto oscurecido */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div
              className="rounded-lg border-2 border-white/90"
              style={{
                width: `${ROI_W * 100}%`,
                height: `${ROI_H * 100}%`,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              }}
            />
            <p className="absolute top-3 inset-x-0 text-center text-xs font-medium text-white/90 px-4">
              Encuadra la fecha dentro del recuadro
            </p>
          </div>

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
            {torchSupported ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTorch}
                className="text-white hover:bg-white/10"
                aria-label={torchOn ? "Apagar linterna" : "Encender linterna"}
              >
                {torchOn ? <Zap className="h-5 w-5 text-yellow-300" /> : <ZapOff className="h-5 w-5" />}
              </Button>
            ) : (
              <span className="h-10 w-10" />
            )}
          </div>
        </>
      )}
    </div>
  )
}
