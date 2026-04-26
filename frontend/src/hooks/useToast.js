import { toast } from "sonner"

export function useToast() {
  return {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options),
    info: (message, options) => toast(message, options),
    warning: (message, options) => toast.warning(message, options),
  }
}
