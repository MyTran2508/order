import { Test, TestingModule } from '@nestjs/testing';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderUtils } from 'src/order/order.utils';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MailService } from 'src/mail/mail.service';
import { InvoiceService } from 'src/invoice/invoice.service';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { NotificationUtils } from 'src/notification/notification.utils';
import { repositoryMockFactory } from 'src/test-utils/repository-mock.factory';
import { Order } from 'src/order/order.entity';
import { Job } from './job.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { MAPPER_MODULE_PROVIDER } from 'src/app/app.constants';
import { mapperMockFactory } from 'src/test-utils/mapper-mock.factory';
import { MenuUtils } from 'src/menu/menu.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { PdfService } from 'src/pdf/pdf.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { ChefOrderItemUtils } from 'src/chef-order-item/chef-order-item.utils';
import { MailProducer } from 'src/mail/mail.producer';
import { NotificationProducer } from 'src/notification/notification.producer';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { User } from 'src/user/user.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';
import { JobRecoveryService } from './job.recovery';
import { JobScheduler } from './job.scheduler';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';

describe('JobController', () => {
  let controller: JobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        JobScheduler,
        TransactionManagerService,
        JobService,
        OrderUtils,
        MailService,
        InvoiceService,
        ChefOrderUtils,
        MenuUtils,
        MenuItemUtils,
        PdfService,
        QrCodeService,
        ChefOrderItemUtils,
        JobRecoveryService,
        NotificationUtils,
        MailProducer,
        NotificationProducer,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: console,
        },
        {
          provide: MAPPER_MODULE_PROVIDER,
          useFactory: mapperMockFactory,
        },
        { provide: 'BullQueue_job', useValue: {} },
        { provide: 'BullQueue_mail', useValue: {} },
        { provide: 'BullQueue_notification', useValue: {} },
        {
          provide: getRepositoryToken(Order),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(CardOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Job),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Invoice),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefArea),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ChefOrderItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Menu),
          useFactory: repositoryMockFactory,
        },
        {
          provide: TransactionManagerService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobController>(JobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
