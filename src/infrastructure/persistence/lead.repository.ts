import { Injectable, Logger } from '@nestjs/common';
import { LeadRecord, LeadRepositoryPort } from '../../domain';

@Injectable()
export class InMemoryLeadRepository implements LeadRepositoryPort {
  private readonly logger = new Logger(InMemoryLeadRepository.name);
  private readonly records = new Map<string, LeadRecord>();

  async save(record: LeadRecord): Promise<void> {
    const key = `${record.sessionId}::${record.responseId}`;
    if (this.records.has(key)) {
      this.logger.debug(
        `Lead already persisted for ${key}; skipping duplicate.`,
      );
      return;
    }

    this.records.set(key, record);
  }

  async findAll(): Promise<LeadRecord[]> {
    return Array.from(this.records.values());
  }

  async clear(): Promise<void> {
    this.records.clear();
  }
}
