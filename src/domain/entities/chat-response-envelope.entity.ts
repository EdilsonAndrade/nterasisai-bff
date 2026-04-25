import { AudioPayload } from '../value-objects/audio-payload';
import { CacheDirective } from '../value-objects/cache-directive';

export interface ChatResponseEnvelopeProps {
  responseId: string;
  sessionId: string;
  text?: string;
  audio?: AudioPayload;
  cacheable: boolean;
  sensitive?: boolean;
  maxAgeSeconds?: number;
  cacheReason?: string;
  createdAt?: Date;
}

export class ChatResponseEnvelopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatResponseEnvelopeError';
  }
}

export class ChatResponseEnvelope {
  private constructor(
    public readonly responseId: string,
    public readonly sessionId: string,
    public readonly text: string | undefined,
    public readonly audio: AudioPayload | undefined,
    public readonly cacheable: boolean,
    public readonly sensitive: boolean,
    public readonly maxAgeSeconds: number | undefined,
    public readonly cacheReason: string | undefined,
    public readonly createdAt: Date,
  ) {}

  static create(props: ChatResponseEnvelopeProps): ChatResponseEnvelope {
    const responseId = props.responseId?.trim();
    const sessionId = props.sessionId?.trim();
    if (!responseId) {
      throw new ChatResponseEnvelopeError('responseId is required.');
    }
    if (!sessionId) {
      throw new ChatResponseEnvelopeError('sessionId is required.');
    }

    const cleanedText = props.text?.trim();
    const hasText = Boolean(cleanedText);
    const hasAudio = Boolean(props.audio);

    if (!hasText && !hasAudio) {
      throw new ChatResponseEnvelopeError(
        'Response must include text or audio.',
      );
    }

    const sensitive = Boolean(props.sensitive);
    const cacheable = sensitive ? false : Boolean(props.cacheable);

    return new ChatResponseEnvelope(
      responseId,
      sessionId,
      cleanedText,
      props.audio,
      cacheable,
      sensitive,
      cacheable ? props.maxAgeSeconds : undefined,
      cacheable ? undefined : (props.cacheReason ?? 'Response not cacheable.'),
      props.createdAt ?? new Date(),
    );
  }

  cacheDirective(): CacheDirective {
    if (!this.cacheable) {
      return CacheDirective.noStore(
        this.cacheReason ?? 'Response not cacheable.',
      );
    }
    return CacheDirective.cacheableSession(this.maxAgeSeconds);
  }
}
