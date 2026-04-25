export type CacheScope = 'private' | 'public';

export interface CacheDirectiveProps {
  cacheable: boolean;
  scope?: CacheScope;
  maxAgeSeconds?: number;
  mustRevalidate?: boolean;
  reason?: string;
}

export class CacheDirectiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheDirectiveError';
  }
}

const DEFAULT_CACHEABLE_MAX_AGE = 60;

export class CacheDirective {
  private constructor(
    public readonly cacheable: boolean,
    public readonly scope: CacheScope,
    public readonly maxAgeSeconds: number,
    public readonly mustRevalidate: boolean,
    public readonly reason: string | undefined,
  ) {}

  static cacheableSession(
    maxAgeSeconds: number = DEFAULT_CACHEABLE_MAX_AGE,
  ): CacheDirective {
    if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds <= 0) {
      throw new CacheDirectiveError(
        'maxAgeSeconds must be greater than zero for cacheable directives.',
      );
    }
    return new CacheDirective(true, 'private', maxAgeSeconds, true, undefined);
  }

  static noStore(reason: string): CacheDirective {
    if (!reason?.trim()) {
      throw new CacheDirectiveError(
        'A reason is required for non-cacheable directives.',
      );
    }
    return new CacheDirective(false, 'private', 0, false, reason.trim());
  }

  static fromProps(props: CacheDirectiveProps): CacheDirective {
    if (!props.cacheable) {
      return CacheDirective.noStore(
        props.reason ?? 'Response is not cacheable.',
      );
    }
    return CacheDirective.cacheableSession(
      props.maxAgeSeconds ?? DEFAULT_CACHEABLE_MAX_AGE,
    );
  }

  toHeaderValue(): string {
    if (!this.cacheable) {
      return 'no-store';
    }
    const parts = [this.scope, `max-age=${this.maxAgeSeconds}`];
    if (this.mustRevalidate) {
      parts.push('must-revalidate');
    }
    return parts.join(', ');
  }
}
