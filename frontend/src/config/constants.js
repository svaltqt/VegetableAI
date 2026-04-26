export const APP_NAME = "VegetableAI"
export const APP_TAGLINE = "PWA de inventario inteligente"

export const PRODUCT_CATEGORIES = [
  { value: "envasado", label: "Envasado" },
  { value: "fruta", label: "Fruta" },
  { value: "verdura", label: "Verdura" },
  { value: "lacteo", label: "Lácteo" },
  { value: "carnico", label: "Cárnico" },
  { value: "otro", label: "Otro" },
]

export const PRODUCT_STATUSES = [
  { value: "vigente", label: "Vigente" },
  { value: "proximo", label: "Próximo a vencer" },
  { value: "vencido", label: "Vencido" },
]

// El backend devuelve los estados como strings legibles. Aquí mapeamos al canónico.
export const BACKEND_STATUS_MAP = {
  Vigente: "vigente",
  "Próximo a vencer": "proximo",
  Vencido: "vencido",
}

export const ALERT_PREFERENCES = [
  { value: 7, label: "7 días antes" },
  { value: 3, label: "3 días antes" },
  { value: 1, label: "1 día antes" },
]

export const IMAGE_RULES = {
  maxSizeBytes: 5 * 1024 * 1024,
  maxSizeLabel: "5 MB",
  acceptedTypes: ["image/jpeg", "image/jpg", "image/png"],
  acceptedExtensions: ["jpg", "jpeg", "png"],
  acceptedAttribute: "image/jpeg,image/jpg,image/png",
}

export const STATUS_THRESHOLD_DAYS = 3

export const NOTIFICATION_STATES = {
  PENDIENTE: "pendiente",
  VISTA: "vista",
  DESCARTADA: "descartada",
}

export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  INVENTORY: "inventory_images",
}
