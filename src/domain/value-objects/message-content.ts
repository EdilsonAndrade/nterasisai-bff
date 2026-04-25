import { UploadedAudioFile } from '../entities';

export class MessageContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MessageContentError';
  }
}

export class MessageContent {
  private constructor(
    private readonly normalizedText: string | undefined,
    private readonly uploadedAudio: UploadedAudioFile | undefined,
  ) {}

  static create(
    text: string | undefined,
    audioFile: UploadedAudioFile | undefined,
  ): MessageContent {
    const cleanedText = text?.trim();
    const hasText = Boolean(cleanedText);
    const hasAudio = Boolean(audioFile);

    if (!hasText && !hasAudio) {
      throw new MessageContentError(
        'Message must contain text, audio, or both.',
      );
    }

    return new MessageContent(cleanedText || undefined, audioFile);
  }

  get hasText(): boolean {
    return Boolean(this.normalizedText);
  }

  get hasAudio(): boolean {
    return Boolean(this.uploadedAudio);
  }

  get text(): string | undefined {
    return this.normalizedText;
  }

  get audio(): UploadedAudioFile | undefined {
    return this.uploadedAudio;
  }
}
