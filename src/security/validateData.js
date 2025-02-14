import { z } from "zod";

export const signupSchema = z.object({
  fullname: z
    .string()
    .regex(/^[a-zA-Z\s]*$/, "Fullname can only contain letters and spaces")
    .min(3, "Fullname must be at least 3 characters")
    .max(30, "Fullname cannot exceed 30 characters"),

  email: z.string().email("Invalid email format").toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(8),
});

export const upsertPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  // banner: z.string().min(1, "Title is required"),
  tags: z.string().array().nonempty(),
  content: z.string().min(1, "Content is required"),
  draft: z.boolean().default(true),
});
