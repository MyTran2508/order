import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Repository,
  UpdateEvent,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { CardOrder } from './entities/card-order.entity';
import { CardOrderStatus } from './card-order.enum';
import { SchedulerRegistry } from '@nestjs/schedule';
import { createCancelCardOrderJobName } from './card-order.constants';
import { ConfigService } from '@nestjs/config';

@EventSubscriber()
export class CardOrderSubscriber
  implements EntitySubscriberInterface<CardOrder>
{
  private readonly CANCEL_CARD_ORDER_JOB_DELAY = 1000 * 60 * 15;

  constructor(
    dataSource: DataSource,
    @InjectRepository(CardOrder)
    private readonly cardOrderRepository: Repository<CardOrder>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return CardOrder;
  }

  async afterInsert(event: InsertEvent<CardOrder>): Promise<any> {
    const { entity } = event;
    await this.addCancelCardOrderJob(entity);
  }

  async afterUpdate(event: UpdateEvent<CardOrder>): Promise<any> {
    const { databaseEntity } = event;
    await this.deleteCancelCardOrderJob(databaseEntity);
  }

  async addCancelCardOrderJob(entity: CardOrder) {
    const context = `${CardOrderSubscriber.name}.${this.addCancelCardOrderJob.name}`;
    this.logger.log(`Adding cancel card order job ${entity.id}`, context);

    if (entity.status !== CardOrderStatus.PENDING) return;

    const JobName = createCancelCardOrderJobName(entity.id);
    const delay =
      +this.configService.get('CARD_ORDER_PAYMENT_TIMEOUT') ||
      this.CANCEL_CARD_ORDER_JOB_DELAY;
    let job;

    try {
      job = this.schedulerRegistry.getTimeout(JobName);
    } catch (error) {
      this.logger.error(
        `Error when adding cancel card order job ${JobName}: ${error.message}`,
        error.stack,
        context,
      );
    }

    const timeoutId = setTimeout(async () => {
      Object.assign(entity, {
        status: CardOrderStatus.CANCELLED,
        deletedAt: new Date(),
      });
      await this.cardOrderRepository.save(entity);
    }, delay);

    if (!job) {
      this.schedulerRegistry.addTimeout(JobName, timeoutId);
      this.logger.log(
        `Add cancel card order job ${JobName} successfully`,
        context,
      );
    }
  }

  async deleteCancelCardOrderJob(entity: CardOrder) {
    const context = `${CardOrderSubscriber.name}.${this.deleteCancelCardOrderJob.name}`;
    this.logger.log(`Deleting cancel card order job ${entity.id}`, context);

    if (entity.status === CardOrderStatus.PENDING) return;

    const JobName = createCancelCardOrderJobName(entity.id);

    let job;
    try {
      job = this.schedulerRegistry.getTimeout(JobName);
    } catch (error) {
      this.logger.error(
        `Error when deleting cancel card order job ${JobName}: ${error.message}`,
        error.stack,
        context,
      );
    }

    if (job) this.schedulerRegistry.deleteTimeout(JobName);
  }
}
