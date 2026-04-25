export const AI_ENGINE_CONFIG = 'AI_ENGINE_CONFIG';

export interface AIEngineConfig {
  baseUrl: string;
  internalSecret: string;
  allowedOrigins: string[];
  chatThrottleLimit: number;
  chatThrottleTtlMs: number;
}

const DEFAULT_AI_ENGINE_URL = 'http://localhost:8000';
const DEFAULT_CHAT_THROTTLE_LIMIT = 10;
const DEFAULT_CHAT_THROTTLE_TTL_MS = 60_000;

const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export const parseAllowedOrigins = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigins: string[],
): boolean => {
  if (!origin) {
    return false;
  }

  return allowedOrigins.includes('*') || allowedOrigins.includes(origin);
};

export const loadAIEngineConfig = (
  env: NodeJS.ProcessEnv = process.env,
): AIEngineConfig => ({
  baseUrl: env.AI_ENGINE_URL?.trim() || DEFAULT_AI_ENGINE_URL,
  internalSecret: env.AI_ENGINE_INTERNAL_SECRET?.trim() || '',
  allowedOrigins: parseAllowedOrigins(env.FRONTEND_ALLOWED_ORIGINS),
  chatThrottleLimit: parsePositiveNumber(
    env.CHAT_THROTTLE_LIMIT,
    DEFAULT_CHAT_THROTTLE_LIMIT,
  ),
  chatThrottleTtlMs: parsePositiveNumber(
    env.CHAT_THROTTLE_TTL_MS,
    DEFAULT_CHAT_THROTTLE_TTL_MS,
  ),
});