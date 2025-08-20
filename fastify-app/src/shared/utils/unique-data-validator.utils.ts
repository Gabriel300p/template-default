import { PrismaClient } from "@prisma/client";
import { ConflictError, ValidationError } from "../errors/app-errors.js";
import { PrismaSafeOperations } from "./prisma-safe.utils.js";

/**
 * 🛡️ Unique Data Validator
 * Validates unique constraints for Brazilian business rules
 */
export class UniqueDataValidator {
  constructor(
    private prisma: PrismaClient,
    private prismaSafe: PrismaSafeOperations
  ) {}

  /**
   * 📧 Validate unique email
   */
  async validateUniqueEmail(
    email: string,
    excludeUserId?: string
  ): Promise<void> {
    const existingUser = await this.prismaSafe.safeExecute(async (prisma) => {
      return await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true },
      });
    });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictError(
        `Email ${email} já está cadastrado no sistema. Use outro email ou faça login na conta existente.`,
        { code: "DUPLICATE_EMAIL", email, existingRole: existingUser.role }
      );
    }
  }

  /**
   * 🆔 Validate unique CPF (Brazilian validation)
   */
  async validateUniqueCpf(cpf: string, excludeUserId?: string): Promise<void> {
    // First validate CPF format
    if (!this.isValidCpf(cpf)) {
      throw new ValidationError(
        "CPF inválido. Verifique se o CPF foi digitado corretamente (apenas números).",
        { code: "INVALID_CPF_FORMAT", cpf: this.maskCpf(cpf) }
      );
    }

    const existingUser = await this.prismaSafe.safeExecute(async (prisma) => {
      return await prisma.user.findUnique({
        where: { cpf },
        select: { id: true, cpf: true, email: true, role: true },
      });
    });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictError(
        `CPF ${this.maskCpf(
          cpf
        )} já está cadastrado no sistema. Use outro CPF ou faça login na conta existente.`,
        {
          code: "DUPLICATE_CPF",
          cpf: this.maskCpf(cpf),
          existingEmail: this.maskEmail(existingUser.email),
          existingRole: existingUser.role,
        }
      );
    }
  }

  /**
   * 🌍 Validate unique passport (for foreigners)
   */
  async validateUniquePassport(
    passport: string,
    excludeUserId?: string
  ): Promise<void> {
    if (!passport || passport.trim().length < 6) {
      throw new ValidationError(
        "Número do passaporte inválido. Deve ter pelo menos 6 caracteres.",
        {
          code: "INVALID_PASSPORT_FORMAT",
          passport: passport?.substring(0, 3) + "***",
        }
      );
    }

    const existingUser = await this.prismaSafe.safeExecute(async (prisma) => {
      return await prisma.user.findUnique({
        where: { passport },
        select: { id: true, passport: true, email: true, role: true },
      });
    });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictError(
        `Passaporte ${passport.substring(
          0,
          3
        )}*** já está cadastrado no sistema.`,
        {
          code: "DUPLICATE_PASSPORT",
          passport: passport.substring(0, 3) + "***",
          existingEmail: this.maskEmail(existingUser.email),
          existingRole: existingUser.role,
        }
      );
    }
  }

  /**
   * 📱 Validate unique phone (Brazilian format)
   */
  async validateUniquePhone(
    phone: string,
    excludeUserId?: string
  ): Promise<void> {
    // Normalize phone (remove formatting)
    const normalizedPhone = this.normalizePhone(phone);

    if (!this.isValidBrazilianPhone(normalizedPhone)) {
      throw new ValidationError(
        "Número de telefone inválido. Use o formato brasileiro: +5511999999999 ou 11999999999.",
        { code: "INVALID_PHONE_FORMAT", phone: this.maskPhone(phone) }
      );
    }

    const existingUser = await this.prismaSafe.safeExecute(async (prisma) => {
      return await prisma.user.findFirst({
        where: { phone: normalizedPhone },
        select: { id: true, phone: true, email: true, role: true },
      });
    });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictError(
        `Telefone ${this.maskPhone(
          normalizedPhone
        )} já está cadastrado no sistema.`,
        {
          code: "DUPLICATE_PHONE",
          phone: this.maskPhone(normalizedPhone),
          existingEmail: this.maskEmail(existingUser.email),
          existingRole: existingUser.role,
        }
      );
    }
  }

  /**
   * 🏪 Validate unique barbershop name in same city/region
   */
  async validateUniqueBarbershopName(
    name: string,
    ownerId: string,
    excludeBarbershopId?: string
  ): Promise<void> {
    const existingBarbershop = await this.prismaSafe.safeExecute(
      async (prisma) => {
        return await prisma.barbershop.findFirst({
          where: {
            name: {
              equals: name,
              mode: "insensitive", // Case insensitive
            },
            id: excludeBarbershopId ? { not: excludeBarbershopId } : undefined,
          },
          select: {
            id: true,
            name: true,
            owner_user_id: true,
            owner: {
              select: { email: true },
            },
          },
        });
      }
    );

    if (existingBarbershop) {
      if (existingBarbershop.owner_user_id === ownerId) {
        throw new ConflictError(
          `Você já possui uma barbearia com o nome "${name}". Escolha outro nome.`,
          {
            code: "DUPLICATE_BARBERSHOP_NAME_SAME_OWNER",
            name,
            existingBarbershopId: existingBarbershop.id,
          }
        );
      } else {
        throw new ConflictError(
          `Já existe uma barbearia com o nome "${name}". Escolha outro nome para sua barbearia.`,
          {
            code: "DUPLICATE_BARBERSHOP_NAME",
            name,
            existingOwnerEmail: this.maskEmail(existingBarbershop.owner.email),
          }
        );
      }
    }
  }

  /**
   * 🔍 Validate all user unique fields at once
   */
  async validateUserUniqueFields(data: {
    email?: string;
    cpf?: string;
    passport?: string;
    phone?: string;
    excludeUserId?: string;
  }): Promise<void> {
    const validations: Promise<void>[] = [];

    if (data.email) {
      validations.push(
        this.validateUniqueEmail(data.email, data.excludeUserId)
      );
    }

    if (data.cpf) {
      validations.push(this.validateUniqueCpf(data.cpf, data.excludeUserId));
    }

    if (data.passport) {
      validations.push(
        this.validateUniquePassport(data.passport, data.excludeUserId)
      );
    }

    if (data.phone) {
      validations.push(
        this.validateUniquePhone(data.phone, data.excludeUserId)
      );
    }

    // Execute all validations in parallel
    await Promise.all(validations);
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * 🔍 Validate CPF algorithm (Brazilian)
   */
  private isValidCpf(cpf: string): boolean {
    // Remove formatting
    const cleanCpf = cpf.replace(/\D/g, "");

    // Check length
    if (cleanCpf.length !== 11) return false;

    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;

    if (parseInt(cleanCpf[9]) !== digit1) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;

    return parseInt(cleanCpf[10]) === digit2;
  }

  /**
   * 📱 Validate Brazilian phone format
   */
  private isValidBrazilianPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, "");

    // Brazilian patterns:
    // 11999999999 (11 digits - mobile)
    // 1133333333 (10 digits - landline)
    // 5511999999999 (13 digits - with country code)

    if (cleanPhone.length === 11) {
      // Mobile: starts with 9
      return cleanPhone[2] === "9";
    }

    if (cleanPhone.length === 10) {
      // Landline: doesn't start with 9
      return cleanPhone[2] !== "9";
    }

    if (cleanPhone.length === 13) {
      // With country code: starts with 55
      return cleanPhone.startsWith("55");
    }

    return false;
  }

  /**
   * 📱 Normalize phone number
   */
  private normalizePhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, "");

    // Add Brazil country code if missing
    if (cleanPhone.length === 11 || cleanPhone.length === 10) {
      return `+55${cleanPhone}`;
    }

    if (cleanPhone.length === 13 && cleanPhone.startsWith("55")) {
      return `+${cleanPhone}`;
    }

    return phone; // Return as-is if unrecognized format
  }

  /**
   * 🎭 Mask CPF for privacy
   */
  private maskCpf(cpf: string): string {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length === 11) {
      return `${cleanCpf.substring(0, 3)}.***.*${cleanCpf.substring(9)}`;
    }
    return cpf.substring(0, 3) + "***";
  }

  /**
   * 🎭 Mask email for privacy
   */
  private maskEmail(email: string): string {
    const [name, domain] = email.split("@");
    if (name.length <= 2) {
      return `${name[0]}***@${domain}`;
    }
    return `${name.substring(0, 2)}***@${domain}`;
  }

  /**
   * 🎭 Mask phone for privacy
   */
  private maskPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length >= 10) {
      return `${cleanPhone.substring(0, 4)}***${cleanPhone.substring(
        cleanPhone.length - 2
      )}`;
    }
    return phone.substring(0, 3) + "***";
  }
}

/**
 * 🏭 Factory function to create UniqueDataValidator instance
 */
export function createUniqueDataValidator(
  prisma: PrismaClient,
  prismaSafe: PrismaSafeOperations
): UniqueDataValidator {
  return new UniqueDataValidator(prisma, prismaSafe);
}

/**
 * 🛠️ Helper decorator for Fastify
 */
declare module "fastify" {
  interface FastifyInstance {
    uniqueValidator: UniqueDataValidator;
  }
}
