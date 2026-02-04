import { z } from "zod";

export const eventsSearchParamsDtoSchema = z.object({
  page: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().int().positive().max(1000)),
});

export type EventsSearchParamsDto = z.infer<typeof eventsSearchParamsDtoSchema>;
