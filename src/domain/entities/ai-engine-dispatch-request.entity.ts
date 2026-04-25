export interface AIEngineAudioPayload {
  fileName: string;
  mediaType: string;
  contentBase64: string;
}

export class AIEngineDispatchRequest {
  constructor(
    public readonly requestId: string,
    public readonly text: string | undefined,
    public readonly audioPayload: AIEngineAudioPayload | undefined,
    public readonly requestedAt: Date = new Date(),
  ) {}
}