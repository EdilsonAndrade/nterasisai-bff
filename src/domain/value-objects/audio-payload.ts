export interface AudioPayloadProps {
  mimeType: string;
  contentBase64: string;
  durationMs?: number;
}

export class AudioPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioPayloadError';
  }
}

const SUPPORTED_MIME_TYPES = new Set([
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/webm',
  'audio/aac',
  'audio/flac',
]);

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export class AudioPayload {
  private constructor(
    public readonly mimeType: string,
    public readonly contentBase64: string,
    public readonly durationMs: number | undefined,
  ) {}

  static create(props: AudioPayloadProps): AudioPayload {
    const mimeType = props.mimeType?.trim().toLowerCase();
    if (!mimeType) {
      throw new AudioPayloadError('Audio mimeType is required.');
    }

    if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
      throw new AudioPayloadError(
        `Audio mimeType "${mimeType}" is not supported.`,
      );
    }

    const content = props.contentBase64?.trim();
    if (!content) {
      throw new AudioPayloadError('Audio contentBase64 is required.');
    }

    if (!BASE64_PATTERN.test(content)) {
      throw new AudioPayloadError(
        'Audio contentBase64 is not a valid base64 string.',
      );
    }

    if (props.durationMs !== undefined) {
      if (!Number.isInteger(props.durationMs) || props.durationMs <= 0) {
        throw new AudioPayloadError(
          'Audio durationMs must be a positive integer.',
        );
      }
    }

    return new AudioPayload(mimeType, content, props.durationMs);
  }

  toPlain(): AudioPayloadProps {
    return {
      mimeType: this.mimeType,
      contentBase64: this.contentBase64,
      ...(this.durationMs !== undefined ? { durationMs: this.durationMs } : {}),
    };
  }
}
