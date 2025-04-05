import { Test, TestingModule } from '@nestjs/testing';
import { BranchRevenueController } from './branch-revenue.controller';
import { BranchRevenueService } from './branch-revenue.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BranchRevenue } from './branch-revenue.entity';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Branch } from 'src/branch/branch.entity';
import { DataSource } from 'typeorm';
import { dataSourceMockFactory } from 'src/test-utils/datasource-mock.factory';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

describe('BranchRevenueController', () => {
  let controller: BranchRevenueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchRevenueController],
      providers: [
        BranchRevenueService,
        TransactionManagerService,
        { provide: DataSource, useFactory: dataSourceMockFactory },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useValue: {},
        },
        {
          provide: getRepositoryToken(BranchRevenue),
          useValue: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Branch),
          useValue: repositoryMockFactory,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
      ],
    }).compile();

    controller = module.get<BranchRevenueController>(BranchRevenueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
