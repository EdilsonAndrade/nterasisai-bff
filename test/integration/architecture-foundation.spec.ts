import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('Architectural foundation', () => {
  const projectRoot = process.cwd();
  const expectedPaths = [
    'src/domain/index.ts',
    'src/domain/entities/index.ts',
    'src/domain/value-objects/index.ts',
    'src/domain/ports/index.ts',
    'src/application/index.ts',
    'src/application/use-cases/index.ts',
    'src/application/dto/index.ts',
    'src/infrastructure/index.ts',
    'src/infrastructure/adapters/index.ts',
    'src/infrastructure/persistence/index.ts',
    'src/infrastructure/config/index.ts',
    'src/presentation/index.ts',
    'src/presentation/controllers/index.ts',
    'src/presentation/graphql/index.ts',
  ];

  it('exposes dedicated entry points for all planned architecture layers', () => {
    const missingPaths = expectedPaths.filter(
      (relativePath) => !existsSync(join(projectRoot, relativePath)),
    );

    expect(missingPaths).toEqual([]);
  });
});
