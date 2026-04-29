export const chatRequestBodyDescription =
  'Payload do chat. Pode ser enviado como JSON (`application/json`) com `text` ou como `multipart/form-data` incluindo um arquivo de audio no campo `audio`.';

export const chatTextSchema = {
  type: 'string',
  maxLength: 4000,
  description:
    'Conteudo textual da mensagem do usuario. Pelo menos um entre `text` ou `audio` deve ser informado.',
  example: 'Ola, pode me ajudar a contratar uma proposta?',
} as const;

export const chatJsonRequestSchema = {
  type: 'object',
  properties: {
    text: chatTextSchema,
  },
} as const;

export const chatMultipartRequestSchema = {
  type: 'object',
  properties: {
    text: chatTextSchema,
    audio: {
      type: 'string',
      format: 'binary',
      description:
        'Arquivo de audio multipart com a mensagem falada do usuario.',
    },
  },
} as const;

export const chatJsonRequestExamples = {
  textOnly: {
    summary: 'Mensagem textual',
    value: {
      text: 'Ola, pode me ajudar a contratar uma proposta?',
    },
  },
} as const;
