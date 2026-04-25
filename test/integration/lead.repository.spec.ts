import { LeadRecord } from '../../src/domain/entities';
import { InMemoryLeadRepository } from '../../src/infrastructure/persistence';

describe('InMemoryLeadRepository', () => {
  const buildRecord = (
    overrides: Partial<{
      id: string;
      sessionId: string;
      responseId: string;
      name: string;
      company: string;
    }> = {},
  ): LeadRecord =>
    LeadRecord.create({
      id: overrides.id ?? 'lead_1',
      sessionId: overrides.sessionId ?? 'ses_1',
      responseId: overrides.responseId ?? 'resp_1',
      name: overrides.name ?? 'Alice',
      company: overrides.company,
      capturedAt: new Date(),
    });

  it('persists a valid lead', async () => {
    const repo = new InMemoryLeadRepository();
    await repo.save(buildRecord());

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Alice');
  });

  it('deduplicates by sessionId + responseId', async () => {
    const repo = new InMemoryLeadRepository();
    await repo.save(buildRecord({ id: 'lead_1' }));
    await repo.save(buildRecord({ id: 'lead_2' }));

    const all = await repo.findAll();
    expect(all).toHaveLength(1);
  });

  it('rejects creating a record without name and company', () => {
    expect(() =>
      LeadRecord.create({
        id: 'lead_1',
        sessionId: 'ses_1',
        responseId: 'resp_1',
        capturedAt: new Date(),
      }),
    ).toThrow('Lead must contain at least name or company.');
  });
});
