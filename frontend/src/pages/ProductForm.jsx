import { useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Topbar } from "@/components/layout/Topbar"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateProduct, useProduct, useUpdateProduct } from "@/hooks/useProducts"
import { useToast } from "@/hooks/useToast"
import { productSchema } from "@/utils/validation"
import { PRODUCT_CATEGORIES } from "@/config/constants"
import { ROUTES } from "@/config/routes"
import { formatDateISO } from "@/utils/dates"

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const { data: existing, isLoading } = useProduct(id)
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      expirationDate: "",
      quantity: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (isEdit && existing) {
      const raw = (existing.category ?? "").toString().trim().toLowerCase()
      const match = PRODUCT_CATEGORIES.find(
        (c) => c.value.toLowerCase() === raw || c.label.toLowerCase() === raw
      )
      reset({
        name: existing.name,
        category: match ? match.value : "",
        expirationDate: formatDateISO(existing.expiration_date),
        quantity: existing.quantity ?? "",
        notes: existing.notes ?? "",
      })
    }
  }, [isEdit, existing, reset])

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      category: data.category,
      expiration_date: data.expirationDate,
      quantity: data.quantity ?? null,
      notes: data.notes ?? "",
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, payload })
        toast.success("Producto actualizado.")
      } else {
        await createMutation.mutateAsync({ ...payload, source: "manual" })
        toast.success("Producto registrado.")
      }
      navigate(ROUTES.INVENTORY)
    } catch (err) {
      toast.error(err.message || "No fue posible guardar el producto.")
    }
  }

  return (
    <>
      <Topbar
        title={isEdit ? "Editar producto" : "Registrar producto"}
        description="Completa los datos para mantener tu inventario al día."
      />
      <PageContainer className="max-w-2xl">
        <Button asChild variant="ghost" className="self-start -ml-2">
          <Link to={ROUTES.INVENTORY}>
            <ArrowLeft className="h-4 w-4" />
            Volver al inventario
          </Link>
        </Button>

        <Card>
          <CardContent className="pt-6">
            {isEdit && isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando producto…</p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre del producto</Label>
                  <Input id="name" placeholder="Ej: Leche entera" {...register("name")} />
                  {errors.name ? (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  ) : null}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Categoría</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category ? (
                      <p className="text-xs text-destructive">{errors.category.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="expirationDate">Fecha de vencimiento</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      {...register("expirationDate")}
                    />
                    {errors.expirationDate ? (
                      <p className="text-xs text-destructive">
                        {errors.expirationDate.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Cantidad (opcional)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={0}
                    placeholder="1"
                    {...register("quantity")}
                  />
                  {errors.quantity ? (
                    <p className="text-xs text-destructive">{errors.quantity.message}</p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Agrega cualquier observación…"
                    {...register("notes")}
                  />
                  {errors.notes ? (
                    <p className="text-xs text-destructive">{errors.notes.message}</p>
                  ) : null}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                  <Button asChild variant="outline" type="button">
                    <Link to={ROUTES.INVENTORY}>Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isEdit ? "Guardar cambios" : "Guardar producto"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </>
  )
}
