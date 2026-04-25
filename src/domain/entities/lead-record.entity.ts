export interface LeadRecordProps {
  id: string;
  sessionId: string;
  responseId: string;
  name?: string;
  company?: string;
  capturedAt: Date;
  createdAt?: Date;
}

export class LeadRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadRecordError';
  }
}

export class LeadRecord {
  private constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly responseId: string,
    public readonly name: string | undefined,
    public readonly company: string | undefined,
    public readonly capturedAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(props: LeadRecordProps): LeadRecord {
    const id = props.id?.trim();
    const sessionId = props.sessionId?.trim();
    const responseId = props.responseId?.trim();
    if (!id) {
      throw new LeadRecordError('Lead id is required.');
    }
    if (!sessionId) {
      throw new LeadRecordError('Lead sessionId is required.');
    }
    if (!responseId) {
      throw new LeadRecordError('Lead responseId is required.');
    }
    if (
      !(props.capturedAt instanceof Date) ||
      Number.isNaN(props.capturedAt.getTime())
    ) {
      throw new LeadRecordError('Lead capturedAt must be a valid Date.');
    }

    const name = props.name?.trim();
    const company = props.company?.trim();
    if (!name && !company) {
      throw new LeadRecordError('Lead must contain at least name or company.');
    }
    if (name && name.length > 200) {
      throw new LeadRecordError(
        'Lead name exceeds maximum length of 200 characters.',
      );
    }
    if (company && company.length > 200) {
      throw new LeadRecordError(
        'Lead company exceeds maximum length of 200 characters.',
      );
    }

    return new LeadRecord(
      id,
      sessionId,
      responseId,
      name,
      company,
      props.capturedAt,
      props.createdAt ?? new Date(),
    );
  }
}
