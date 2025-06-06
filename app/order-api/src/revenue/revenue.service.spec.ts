import { Test, TestingModule } from '@nestjs/testing';
import { RevenueService } from './revenue.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Revenue } from './revenue.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { BranchRevenue } from 'src/branch-revenue/branch-revenue.entity';

describe('RevenueService', () => {
  let service: RevenueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueService,
        TransactionManagerService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Revenue),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(BranchRevenue),
          useValue: repositoryMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    service = module.get<RevenueService>(RevenueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
