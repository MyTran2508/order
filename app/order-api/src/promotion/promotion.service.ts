import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from './promotion.entity';
import { DataSource, Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  CreatePromotionRequestDto,
  PromotionResponseDto,
  UpdatePromotionRequestDto,
  GetAllPromotionRequestDto,
} from './promotion.dto';
import { Branch } from 'src/branch/branch.entity';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';
import { PromotionException } from './promotion.exception';
import { PromotionValidation } from './promotion.validation';
import * as _ from 'lodash';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { ApplicablePromotionService } from 'src/applicable-promotion/applicable-promotion.service';
import { AppPaginatedResponseDto } from 'src/app/app.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(ApplicablePromotion)
    private readonly applicablePromotionRepository: Repository<ApplicablePromotion>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly applicablePromotionService: ApplicablePromotionService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a promotion
   * @param {string} branchSlug The branch slug
   * @param {CreatePromotionRequestDto} createPromotionRequestDto The create promotion request dto
   * @returns {Promise<PromotionResponseDto>} The promotion response dto
   * @throws {PromotionException} If the end time is less than start time or end time is less than today
   * @throws {BranchException} If the branch is not found
   */
  async createPromotion(
    branchSlug: string,
    createPromotionRequestDto: CreatePromotionRequestDto,
  ): Promise<PromotionResponseDto> {
    const context = `${PromotionService.name}.${this.createPromotion.name}`;

    const promotionData = this.mapper.map(
      createPromotionRequestDto,
      CreatePromotionRequestDto,
      Promotion,
    );

    const today = new Date();
    today.setHours(7, 0, 0, 0);

    if (promotionData.startDate.getTime() > promotionData.endDate.getTime()) {
      this.logger.warn(
        PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_START_TIME
          .message,
        context,
      );
      throw new PromotionException(
        PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_START_TIME,
      );
    }

    if (promotionData.endDate.getTime() < today.getTime()) {
      this.logger.warn(
        PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY.message,
        context,
      );
      throw new PromotionException(
        PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY,
      );
    }

    const branch = await this.branchRepository.findOneBy({ slug: branchSlug });
    if (!branch) {
      this.logger.warn(BranchValidation.BRANCH_NOT_FOUND.message, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    Object.assign(promotionData, { branch });
    const newPromotion = this.promotionRepository.create(promotionData);
    const createdPromotion = await this.promotionRepository.save(newPromotion);

    this.logger.log(
      `Promotion ${createdPromotion.id} created successfully`,
      context,
    );
    const promotionDto = this.mapper.map(
      createdPromotion,
      Promotion,
      PromotionResponseDto,
    );
    return promotionDto;
  }

  /**
   * Get all promotions with pagination
   * @param {GetAllPromotionRequestDto} query The query parameters
   * @returns {Promise<AppPaginatedResponseDto<PromotionResponseDto>>} The paginated promotion response dto
   * @throws {BranchException} If the branch is not found
   */
  async getAllPromotions(
    query: GetAllPromotionRequestDto,
  ): Promise<AppPaginatedResponseDto<PromotionResponseDto>> {
    const context = `${PromotionService.name}.${this.getAllPromotions.name}`;

    const branch = await this.branchRepository.findOneBy({ slug: query.branchSlug });
    if (!branch) {
      this.logger.warn(BranchValidation.BRANCH_NOT_FOUND.message, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    // Construct where options
    const whereOptions: FindOptionsWhere<Promotion> = {
      branch: { slug: query.branchSlug },
    };

    if (query.type) {
      whereOptions.type = query.type;
    }

    // Construct find many options
    const findManyOptions: FindManyOptions<Promotion> = {
      where: whereOptions,
      relations: ['branch'],
      order: { createdAt: 'DESC' },
    };

    if (query.hasPaging) {
      Object.assign(findManyOptions, {
        skip: (query.page - 1) * query.size,
        take: query.size,
      });
    }

    // Execute query
    const [promotions, total] = await this.promotionRepository.findAndCount(findManyOptions);

    // Calculate pagination metadata
    const page = query.hasPaging ? query.page : 1;
    const pageSize = query.hasPaging ? query.size : total;
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const promotionDtos = this.mapper.mapArray(
      promotions,
      Promotion,
      PromotionResponseDto,
    );

    return {
      hasNext,
      hasPrevios: hasPrevious,
      items: promotionDtos,
      total,
      page,
      pageSize,
      totalPages,
    } as AppPaginatedResponseDto<PromotionResponseDto>;
  }

  /**
   * Update a promotion
   * @param {string} slug The promotion slug
   * @param {UpdatePromotionRequestDto} updatePromotionRequestDto The update promotion request dto
   * @returns {Promise<PromotionResponseDto>} The promotion response dto
   * @throws {PromotionException} If the end time is less than start time or end time is less than today
   * @throws {PromotionException} If the promotion is not found
   */
  async updatePromotion(
    slug: string,
    updatePromotionRequestDto: UpdatePromotionRequestDto,
  ): Promise<PromotionResponseDto> {
    const context = `${PromotionService.name}.${this.updatePromotion.name}`;

    const updatePromotionData = this.mapper.map(
      updatePromotionRequestDto,
      UpdatePromotionRequestDto,
      Promotion,
    );

    const updateStartDate = updatePromotionData.startDate.getTime();
    const updateEndDate = updatePromotionData.endDate.getTime();
    const date = new Date();
    date.setHours(7, 0, 0, 0);
    const today = date.getTime();

    if (updateStartDate > updateEndDate) {
      this.logger.warn(
        PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_START_TIME
          .message,
        context,
      );
      throw new PromotionException(
        PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_START_TIME,
      );
    }

    if (updateEndDate < today) {
      this.logger.warn(
        PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY.message,
        context,
      );
      throw new PromotionException(
        PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY,
      );
    }

    const promotion = await this.promotionRepository.findOne({
      where: { slug },
      relations: ['applicablePromotions', 'branch'],
    });

    if (!promotion) {
      this.logger.warn(
        PromotionValidation.PROMOTION_NOT_FOUND.message,
        context,
      );
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }

    const branch = await this.branchRepository.findOneBy({
      slug: updatePromotionRequestDto.branch,
    });
    if (!branch) {
      this.logger.warn(BranchValidation.BRANCH_NOT_FOUND.message, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    if (!_.isEmpty(promotion.applicablePromotions)) {
      if (promotion.branch.id !== branch.id) {
        this.logger.warn(
          PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_BRANCH
            .message,
          context,
        );
        throw new PromotionException(
          PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_BRANCH,
        );
      }

      if (updateStartDate !== new Date(promotion.startDate).getTime()) {
        this.logger.warn(
          PromotionValidation
            .PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_START_TIME.message,
          context,
        );
        throw new PromotionException(
          PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_UPDATE_START_TIME,
        );
      }

      if (updateEndDate !== new Date(promotion.endDate).getTime()) {
        if (updateEndDate < today) {
          this.logger.warn(
            PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY.message,
            context,
          );
          throw new PromotionException(
            PromotionValidation.END_TIME_MUST_BE_GREATER_OR_EQUAL_TODAY,
          );
        }

        // promotion expired, can not update time
        if (new Date(promotion.endDate).getTime() < today) {
          this.logger.warn(
            PromotionValidation.PROMOTION_ALREADY_EXPIRED_CAN_NOT_UPDATE_TIME
              .message,
            context,
          );
          throw new PromotionException(
            PromotionValidation.PROMOTION_ALREADY_EXPIRED_CAN_NOT_UPDATE_TIME,
          );
        }
      }
    }

    const oldPromotionValue = promotion.value;

    Object.assign(promotion, { ...updatePromotionData, branch });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (updatePromotionRequestDto.value !== oldPromotionValue) {
        const date = new Date();
        date.setHours(7, 0, 0, 0);
        const updatedMenuItems = this.getAllMenuItemsByPromotion(
          date,
          promotion,
        );

        await queryRunner.manager.save(updatedMenuItems);
      }
      const updatedPromotion = await queryRunner.manager.save(promotion);

      await queryRunner.commitTransaction();
      this.logger.log(`Promotion updated successfully`, context);

      const promotionDto = this.mapper.map(
        updatedPromotion,
        Promotion,
        PromotionResponseDto,
      );

      return promotionDto;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `An error occurred while update promotion: ${JSON.stringify(error)}`,
        error.stack,
        context,
      );
      throw new PromotionException(
        PromotionValidation.ERROR_WHEN_UPDATE_PROMOTION,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete a promotion
   * @param {string} slug The promotion slug
   * @returns {Promise<number>} The affected row
   * @throws {PromotionException} If the promotion is not found
   * @throws {PromotionException} If the promotion is already applied
   */
  async deletePromotion(slug: string): Promise<number> {
    const context = `${PromotionService.name}.${this.deletePromotion.name}`;

    const promotion = await this.promotionRepository.findOne({
      where: { slug },
      relations: ['applicablePromotions', 'branch', 'orderItems', 'menuItems'],
    });

    if (!promotion) {
      this.logger.warn(
        PromotionValidation.PROMOTION_NOT_FOUND.message,
        context,
      );
      throw new PromotionException(PromotionValidation.PROMOTION_NOT_FOUND);
    }

    if (!_.isEmpty(promotion.applicablePromotions)) {
      this.logger.warn(
        PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE.message,
        context,
      );
      throw new PromotionException(
        PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE,
      );
    }
    if (!_.isEmpty(promotion.orderItems)) {
      this.logger.warn(
        PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE.message,
        context,
      );
      throw new PromotionException(
        PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE,
      );
    }
    if (!_.isEmpty(promotion.menuItems)) {
      this.logger.warn(
        PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE.message,
        context,
      );
      throw new PromotionException(
        PromotionValidation.PROMOTION_ALREADY_APPLIED_CAN_NOT_DELETE,
      );
    }

    const deleted = await this.promotionRepository.softDelete({
      id: promotion.id,
    });

    this.logger.log(`Promotion ${promotion.id} deleted successfully`, context);
    return deleted.affected;
  }

  /**
   * Get all menu items by promotion
   * @param {Date} date The date
   * @param {Promotion} promotion The promotion
   * @returns {Promise<MenuItem[]>} The menu item array
   * @throws {PromotionException} If an error
   */
  async getAllMenuItemsByPromotion(
    date: Date,
    promotion: Promotion,
  ): Promise<MenuItem[]> {
    const context = `${PromotionService.name}.${this.getAllMenuItemsByPromotion.name}`;

    try {
      const applicablePromotions =
        await this.applicablePromotionRepository.find({
          where: {
            promotion: { id: promotion.id },
          },
        });

      if (_.isEmpty(applicablePromotions)) return [];
      const menuItems = await Promise.all(
        applicablePromotions.map(async (applicablePromotion) => {
          return await this.applicablePromotionService.getMenuItemByApplicablePromotion(
            date,
            promotion.branch.id,
            applicablePromotion.applicableId,
            promotion,
          );
        }),
      );
      return menuItems.filter(Boolean); // remove falsy value
    } catch (error) {
      this.logger.error(
        `Error when get menu items by promotion: ${error.message}`,
        error.stack,
        context,
      );
      throw new PromotionException(
        PromotionValidation.ERROR_WHEN_GET_MENU_ITEM_BY_PROMOTION,
      );
    }
  }
}
