import { z } from "zod";

// B-BOSS specific validation schemas

// CPF validation (Brazilian format: 000.000.000-00)
export const cpfSchema = z
  .string()
  .regex(
    /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    "CPF deve estar no formato 000.000.000-00"
  )
  .refine((cpf) => {
    // Remove dots and dashes for validation
    const cleanCpf = cpf.replace(/[.-]/g, "");

    // Check if all digits are the same (invalid CPF)
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;

    return true;
  }, "CPF inválido");

// Passport validation (format: AA 000 000)
export const passportSchema = z
  .string()
  .regex(
    /^[A-Z]{2} \d{3} \d{3}$/,
    "Passaporte deve estar no formato AA 000 000"
  );

// Brazilian phone validation (+55 (11) 9 9999-9999)
export const phoneSchema = z
  .string()
  .regex(
    /^\+55 \(\d{2}\) 9 \d{4}-\d{4}$/,
    "Telefone deve estar no formato +55 (11) 9 9999-9999"
  );

// B-BOSS strong password (10 chars: maiúscula + minúscula + 6 números + especial)
export const strongPasswordSchema = z
  .string()
  .min(10, "Senha deve ter pelo menos 10 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(
    /[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9]/,
    "Senha deve conter pelo menos 6 números"
  )
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial");

// MFA code validation (8 digits)
export const mfaCodeSchema = z
  .string()
  .length(8, "Código MFA deve ter exatamente 8 dígitos")
  .regex(
    /^[A-Z0-9]{8}$/,
    "Código MFA deve conter apenas letras maiúsculas e números"
  );

// Full name validation (50 chars max)
export const fullNameSchema = z
  .string()
  .min(2, "Nome completo deve ter pelo menos 2 caracteres")
  .max(50, "Nome completo não pode exceder 50 caracteres")
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços");

// Email validation (50 chars max)
export const emailSchema = z
  .string()
  .email("Email inválido")
  .max(50, "Email não pode exceder 50 caracteres")
  .toLowerCase();

// Credential validation (email or CPF for login)
export const credentialSchema = z.string().refine((value) => {
  // Check if it's a valid email
  const emailResult = emailSchema.safeParse(value);
  if (emailResult.success) return true;

  // Check if it's a valid CPF
  const cpfResult = cpfSchema.safeParse(value);
  return cpfResult.success;
}, "Credencial deve ser um email válido ou CPF no formato 000.000.000-00");
