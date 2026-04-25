import { MessageContent, MessageContentError } from '../../src/domain/value-objects';

describe('MessageContent', () => {
  it('throws when both text and audio are missing', () => {
    expect(() => MessageContent.create(undefined, undefined)).toThrow(
      MessageContentError,
    );
  });

  it('accepts valid text-only message', () => {
    const content = MessageContent.create('hello', undefined);

    expect(content.hasText).toBe(true);
    expect(content.hasAudio).toBe(false);
    expect(content.text).toBe('hello');
  });

  it('accepts valid audio-only message', () => {
    const content = MessageContent.create(undefined, {
      fileName: 'voice.wav',
      mediaType: 'audio/wav',
      bytes: Buffer.from('abc'),
    });

    expect(content.hasText).toBe(false);
    expect(content.hasAudio).toBe(true);
    expect(content.audio?.fileName).toBe('voice.wav');
  });

  it('accepts payload with text and audio', () => {
    const content = MessageContent.create(' hello ', {
      fileName: 'voice.wav',
      mediaType: 'audio/wav',
      bytes: Buffer.from('abc'),
    });

    expect(content.hasText).toBe(true);
    expect(content.hasAudio).toBe(true);
    expect(content.text).toBe('hello');
  });
});
