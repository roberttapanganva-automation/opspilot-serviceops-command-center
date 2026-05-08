import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email("Enter a valid email address.").optional(),
);

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().min(0, "Estimated value cannot be negative.").optional());

const optionalDateTime = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}, z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid follow-up date.").optional());

export const createLeadSchema = z.object({
  client_email: optionalEmail,
  client_name: optionalText,
  client_phone: optionalText,
  estimated_value: optionalNumber.default(0),
  next_follow_up_at: optionalDateTime,
  notes: optionalText,
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  source: optionalText.default("manual"),
  status: z.enum(["open", "won", "lost"]).default("open"),
  title: z.string().trim().min(1, "Lead title is required."),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
