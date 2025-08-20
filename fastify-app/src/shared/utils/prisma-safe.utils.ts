import { PrismaClient } from "@prisma/client";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";

/**
 * 🛡️ Prisma Safe Operations
 * Wrapper que automaticamente trata erros de cache e reconexão
 */
export class PrismaSafeOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * 🔄 Execute operation with automatic retry on cache errors
   */
  async safeExecute<T>(
    operation: (prisma: PrismaClient) => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation(this.prisma);
      } catch (error) {
        lastError = error as Error;

        // 💾 Handle prepared statement cache conflicts
        if (
          error instanceof PrismaClientUnknownRequestError &&
          error.message.toLowerCase().includes("prepared statement") &&
          error.message.toLowerCase().includes("already exists")
        ) {
          console.warn(
            `🔄 Attempt ${attempt + 1}/${
              maxRetries + 1
            }: Prepared statement conflict detected`
          );

          if (attempt < maxRetries) {
            // Disconnect and reconnect to clear cache
            await this.reconnectDatabase();

            // Wait a bit before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * (attempt + 1))
            );
            continue;
          }
        }

        // For other errors, don't retry
        throw error;
      }
    }

    // If all retries failed, throw the last error
    throw lastError;
  }

  /**
   * 🔌 Force database reconnection
   */
  private async reconnectDatabase(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      await this.prisma.$connect();
      console.log("✅ Database reconnected successfully");
    } catch (error) {
      console.error("❌ Failed to reconnect to database:", error);
      throw error;
    }
  }

  /**
   * 🔍 Safe findUnique operation
   */
  async findUnique<T>(model: any, args: any): Promise<T | null> {
    return this.safeExecute(async (prisma) => {
      return (await model.findUnique(args)) as T | null;
    });
  }

  /**
   * 🔍 Safe findMany operation
   */
  async findMany<T>(model: any, args?: any): Promise<T[]> {
    return this.safeExecute(async (prisma) => {
      return await model.findMany(args);
    });
  }

  /**
   * ➕ Safe create operation
   */
  async create<T>(model: any, args: any): Promise<T> {
    return this.safeExecute(async (prisma) => {
      return await model.create(args);
    });
  }

  /**
   * ✏️ Safe update operation
   */
  async update<T>(model: any, args: any): Promise<T> {
    return this.safeExecute(async (prisma) => {
      return await model.update(args);
    });
  }

  /**
   * 🗑️ Safe delete operation
   */
  async delete<T>(model: any, args: any): Promise<T> {
    return this.safeExecute(async (prisma) => {
      return await model.delete(args);
    });
  }

  /**
   * 🔄 Safe upsert operation
   */
  async upsert<T>(model: any, args: any): Promise<T> {
    return this.safeExecute(async (prisma) => {
      return await model.upsert(args);
    });
  }

  /**
   * 🧮 Safe count operation
   */
  async count(model: any, args?: any): Promise<number> {
    return this.safeExecute(async (prisma) => {
      return await model.count(args);
    });
  }

  /**
   * 🔄 Safe transaction operation
   */
  async transaction<T>(fn: (prisma: any) => Promise<T>): Promise<T> {
    return this.safeExecute(async (prisma) => {
      return await prisma.$transaction(fn);
    });
  }

  /**
   * 📝 Safe raw query operation
   */
  async queryRaw<T>(query: string, ...values: any[]): Promise<T> {
    return this.safeExecute(async (prisma) => {
      return await (prisma as any).$queryRaw`${query}`;
    });
  }

  /**
   * ⚡ Safe execute raw operation
   */
  async executeRaw(query: string, ...values: any[]): Promise<number> {
    return this.safeExecute(async (prisma) => {
      return await (prisma as any).$executeRaw`${query}`;
    });
  }
}

/**
 * 🏭 Factory function to create PrismaSafeOperations instance
 */
export function createPrismaSafeOperations(
  prisma: PrismaClient
): PrismaSafeOperations {
  return new PrismaSafeOperations(prisma);
}

/**
 * 🛠️ Helper decorator for Fastify
 */
declare module "fastify" {
  interface FastifyInstance {
    prismaSafe: PrismaSafeOperations;
  }
}
