import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(4),
  description: z.string().optional(),
});

export const AIFormSchema = z.object({
  name: z.string().min(4).describe("Name can't be null"),
  description: z.string().optional(),
  prompt: z.string().min(10).describe("Prompt should atleast 10 letters")
})

export type AIFormSchemaType = z.infer<typeof AIFormSchema>;

export type formSchemaType = z.infer<typeof formSchema>;
