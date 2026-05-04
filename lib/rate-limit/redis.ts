import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.resting!,
  token: process.env.tkn!,
});
