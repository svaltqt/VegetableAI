import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { alertsService } from "@/services/alerts.service"

const KEYS = { all: ["alerts"], list: () => ["alerts", "list"] }

export function useAlerts() {
  return useQuery({ queryKey: KEYS.list(), queryFn: () => alertsService.list() })
}

export function useUpdateAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => alertsService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useMarkAlertsSeen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => alertsService.markAllSeen(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}
