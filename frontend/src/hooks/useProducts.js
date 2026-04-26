import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { inventoryService } from "@/services/inventory.service"

const KEYS = {
  all: ["products"],
  list: () => ["products", "list"],
  summary: () => ["products", "summary"],
  detail: (id) => ["products", "detail", id],
}

export function useProducts() {
  return useQuery({ queryKey: KEYS.list(), queryFn: () => inventoryService.list() })
}

export function useProduct(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => inventoryService.get(id),
    enabled: Boolean(id),
  })
}

export function useInventorySummary() {
  return useQuery({ queryKey: KEYS.summary(), queryFn: () => inventoryService.summary() })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => inventoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => inventoryService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => inventoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}
