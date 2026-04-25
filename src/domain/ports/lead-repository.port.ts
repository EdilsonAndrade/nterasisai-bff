import { LeadRecord } from '../entities/lead-record.entity';

export const LEAD_REPOSITORY_PORT = 'LEAD_REPOSITORY_PORT';

export interface LeadRepositoryPort {
  save(record: LeadRecord): Promise<void>;
}
