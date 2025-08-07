import { z } from "zod";

// 🎯 Schema principal para Comunicação (entidade completa)
export const comunicacaoSchema = z.object({
  id: z.string(),
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  autor: z
    .string()
    .min(1, "Autor é obrigatório")
    .min(2, "Nome do autor deve ter pelo menos 2 caracteres")
    .max(50, "Nome do autor deve ter no máximo 50 caracteres"),
  tipo: z.enum(["Comunicado", "Aviso", "Notícia"], {
    message: "Tipo deve ser: Comunicado, Aviso ou Notícia",
  }),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  dataCriacao: z.date(),
  dataAtualizacao: z.date(),
});

// 🎯 Schema para formulário (sem id e datas - gerados automaticamente)
export const comunicacaoFormSchema = z.object({
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres")
    .trim(), // Sanitização automática
  autor: z
    .string()
    .min(1, "Autor é obrigatório")
    .min(2, "Nome do autor deve ter pelo menos 2 caracteres")
    .max(50, "Nome do autor deve ter no máximo 50 caracteres")
    .trim(), // Sanitização automática
  tipo: z.enum(["Comunicado", "Aviso", "Notícia"], {
    message: "Tipo deve ser: Comunicado, Aviso ou Notícia",
  }),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .trim(), // Sanitização automática
});

// 🎯 Schema para criação (igual ao form, mas pode ter id opcional para otimistic updates)
export const comunicacaoCreateSchema = comunicacaoFormSchema.extend({
  id: z.string().optional(),
});

// 🎯 Schema para atualização (todos os campos opcionais exceto pelo menos um)
export const comunicacaoUpdateSchema = comunicacaoFormSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser fornecido para atualização",
  });

// 🎯 Tipos inferidos dos schemas (única fonte da verdade)
export type Comunicacao = z.infer<typeof comunicacaoSchema>;
export type ComunicacaoForm = z.infer<typeof comunicacaoFormSchema>;
export type ComunicacaoCreate = z.infer<typeof comunicacaoCreateSchema>;
export type ComunicacaoUpdate = z.infer<typeof comunicacaoUpdateSchema>;

// 🎯 Para retrocompatibilidade (deprecated - usar os novos tipos)
/** @deprecated Use ComunicacaoForm instead */
export type ComunicacaoFormData = ComunicacaoForm;
