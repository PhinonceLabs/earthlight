import "server-only";

import { format } from "date-fns";
import { z } from "zod";
import { lightingLocationSchema } from "@/domain/validation/lighting";
import type { SunTimesData } from "@/utils/scheduleGenerator";

const sunTimesRequestSchema = lightingLocationSchema.extend({
  date: z.date().default(() => new Date()),
});

const sunriseSunsetResponseSchema = z.object({
  status: z.literal("OK"),
  results: z.object({
    sunrise: z.string().datetime({ offset: true }),
    sunset: z.string().datetime({ offset: true }),
  }),
});

export type SunTimesRequest = z.input<typeof sunTimesRequestSchema>;

function convertUtcInstantToTimezoneDate(instant: string, timezone: string): Date {
  const utcDate = new Date(instant);
  return new Date(utcDate.toLocaleString("en-US", { timeZone: timezone }));
}

export async function fetchSunTimesForLocation(input: SunTimesRequest): Promise<SunTimesData> {
  const { latitude, longitude, timezone, date } = sunTimesRequestSchema.parse(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
      date: format(date, "yyyy-MM-dd"),
      formatted: "0",
    });

    const response = await fetch(`https://api.sunrise-sunset.org/json?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Sunrise/sunset service returned an error.");
    }

    const parsed = sunriseSunsetResponseSchema.parse(await response.json());

    return {
      sunrise: convertUtcInstantToTimezoneDate(parsed.results.sunrise, timezone),
      sunset: convertUtcInstantToTimezoneDate(parsed.results.sunset, timezone),
      timezone,
      location: `${latitude.toFixed(2)},${longitude.toFixed(2)}`,
    };
  } finally {
    clearTimeout(timeout);
  }
}
