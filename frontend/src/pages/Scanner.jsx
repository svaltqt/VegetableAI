import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, FolderOpen, RotateCcw, ImageIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Topbar } from "@/components/layout/Topbar"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CameraCapture } from "@/components/scanner/CameraCapture"
import { useOCR } from "@/hooks/useOCR"
import { useCreateProduct } from "@/hooks/useProducts"
import { useToast } from "@/hooks/useToast"
import { validateImageFile, formatBytes } from "@/utils/images"
import { formatDateLocal } from "@/utils/dates"
import { IMAGE_RULES, PRODUCT_CATEGORIES } from "@/config/constants"
import { ROUTES } from "@/config/routes"

export default function Scanner() {
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [productName, setProductName] = useState("")
  const [productCategory, setProductCategory] = useState("")
  const [editableDate, setEditableDate] = useState("")

  const ocrMutation = useOCR()
  const createMutation = useCreateProduct()

  const reset = () => {
    setImageFile(null)
    setImagePreview(null)
    setOcrResult(null)
    setProductName("")
    setProductCategory("")
    setEditableDate("")
  }

  const handleFileSelected = async (file) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.message)
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setOcrResult(null)
    setEditableDate("")

    try {
      const result = await ocrMutation.mutateAsync(file)
      setOcrResult(result)
      if (result.success && result.expiration_date) {
        setEditableDate(result.expiration_date)
        toast.success("Fecha detectada. Confirma o ajusta los datos.")
      } else {
        toast.warning(
          "No se detectó una fecha clara. Puedes registrarla manualmente o intentar con otra imagen."
        )
      }
    } catch (err) {
      toast.error(err.message || "Error al procesar la imagen.")
    }
  }

  const handleCameraCapture = (file) => {
    setShowCamera(false)
    handleFileSelected(file)
  }

  const handleSave = async () => {
    if (!productName.trim()) {
      toast.error("El nombre del producto es obligatorio.")
      return
    }
    if (!editableDate) {
      toast.error("La fecha de vencimiento es obligatoria.")
      return
    }
    if (!productCategory) {
      toast.error("Selecciona una categoría.")
      return
    }

    try {
      await createMutation.mutateAsync({
        name: productName.trim(),
        category: productCategory,
        expiration_date: editableDate,
        quantity: 1,
        notes: "",
        source: "ocr",
      })
      toast.success(`Producto "${productName}" guardado en tu inventario.`)
      reset()
      navigate(ROUTES.INVENTORY)
    } catch (err) {
      toast.error(err.message || "No fue posible guardar el producto.")
    }
  }

  if (showCamera) {
    return (
      <>
        <Topbar
          title="Escanear fecha de vencimiento"
          description="Encuadra la etiqueta del empaque dentro del visor."
        />
        <PageContainer className="max-w-2xl">
          <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />
        </PageContainer>
      </>
    )
  }

  return (
    <>
      <Topbar
        title="Escanear fecha de vencimiento"
        description="Toma una foto o sube una imagen del empaque del producto."
      />

      <PageContainer className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vista previa de la imagen</CardTitle>
            <p className="text-xs text-muted-foreground">
              Formatos permitidos: {IMAGE_RULES.acceptedExtensions.join(", ").toUpperCase()}. Tamaño máximo {IMAGE_RULES.maxSizeLabel}.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-[4/3] rounded-xl border-2 border-dashed bg-muted/40 overflow-hidden flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Vista previa" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-10 w-10" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    Toma una foto o sube una imagen
                  </p>
                  <p className="text-xs">para iniciar el escaneo OCR</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={() => setShowCamera(true)}
                className="w-full"
              >
                <Camera className="h-4 w-4" />
                Usar cámara
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <FolderOpen className="h-4 w-4" />
                Cargar archivo
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_RULES.acceptedAttribute}
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelected(file)
                e.target.value = ""
              }}
            />

            {imageFile ? (
              <p className="text-[11px] text-muted-foreground">
                {imageFile.name} · {formatBytes(imageFile.size)}
              </p>
            ) : null}

            {ocrMutation.isPending ? (
              <div className="rounded-lg border bg-secondary px-3 py-3 flex items-center gap-3 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Procesando imagen con OCR…</span>
              </div>
            ) : null}

            {ocrResult && !ocrResult.success ? (
              <div className="rounded-lg border border-status-warning/30 bg-status-warning-bg/60 px-3 py-3 flex items-start gap-3 text-sm text-status-warning">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-semibold">No detectamos una fecha clara.</p>
                  <p className="text-xs">
                    Puedes intentar con otra foto o registrar la fecha manualmente abajo.
                  </p>
                </div>
              </div>
            ) : null}

            {ocrResult?.success ? (
              <div className="rounded-lg border border-status-fresh/30 bg-status-fresh-bg/60 px-3 py-3 flex items-start gap-3 text-sm text-status-fresh">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-semibold">Fecha detectada</p>
                  <p className="text-xs">
                    Texto leído: <span className="font-mono">{ocrResult.raw_text}</span>
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {imagePreview ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resultado detectado</CardTitle>
              <p className="text-xs text-muted-foreground">
                Confirma los datos antes de guardar el producto.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ocr-name">Nombre del producto</Label>
                <Input
                  id="ocr-name"
                  placeholder="Ej: Leche entera"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ocr-category">Categoría</Label>
                  <Select value={productCategory} onValueChange={setProductCategory}>
                    <SelectTrigger id="ocr-category">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ocr-date">Fecha de vencimiento</Label>
                  <Input
                    id="ocr-date"
                    type="date"
                    value={editableDate}
                    onChange={(e) => setEditableDate(e.target.value)}
                  />
                  {editableDate ? (
                    <p className="text-[11px] text-muted-foreground">
                      Detectada: {formatDateLocal(editableDate)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button variant="outline" onClick={reset} className="sm:w-auto">
                  <RotateCcw className="h-4 w-4" />
                  Reintentar
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Confirmar y guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <p className="text-[11px] text-muted-foreground text-center px-4">
          Las imágenes capturadas se utilizan exclusivamente para extraer la fecha de
          vencimiento. No se compartirán con terceros (OR-01, OR-02).
        </p>
      </PageContainer>
    </>
  )
}
