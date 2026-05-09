import { z } from "zod";

export const updateThemeModeSchema = z.object({
  theme_mode: z.enum(["system", "light", "dark"]),
}).strict();
