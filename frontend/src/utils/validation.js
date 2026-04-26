import { z } from "zod"

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/\d/, "Debe contener al menos un número")

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Nombre demasiado corto"),
    email: z.string().email("Correo electrónico inválido"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
})

export const productSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(120, "Máximo 120 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
  expirationDate: z
    .string()
    .min(1, "Fecha obligatoria")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida"),
  quantity: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v)))
    .refine((v) => v === null || (!Number.isNaN(v) && v >= 0), "Cantidad inválida"),
  notes: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
})

export const profileSchema = z.object({
  fullName: z.string().min(2, "Nombre demasiado corto"),
  alertDays: z.array(z.number()).min(1, "Selecciona al menos una preferencia"),
})
