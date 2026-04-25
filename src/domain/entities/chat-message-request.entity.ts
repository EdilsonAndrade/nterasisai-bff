export interface UploadedAudioFile {
  fileName: string;
  mediaType: string;
  bytes: Buffer;
}

export class ChatMessageRequest {
  constructor(
    public readonly text: string | undefined,
    public readonly audioFile: UploadedAudioFile | undefined,
    public readonly origin: string | undefined,
    public readonly receivedAt: Date = new Date(),
  ) {}
}
