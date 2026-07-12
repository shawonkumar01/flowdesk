import { Test, TestingModule } from '@nestjs/testing';
import { DealsService } from './deals.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Deal } from './entities/deal.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('DealsService', () => {
  let service: DealsService;

  const mockDealRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        {
          provide: getRepositoryToken(Deal),
          useValue: mockDealRepository,
        },
        {
          provide: getRepositoryToken(OrganizationMember),
          useValue: mockMemberRepository,
        },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new deal', async () => {
      const createDealDto = {
        title: 'Test Deal',
        amount: 10000,
        customerId: 'cust1',
      };

      mockMemberRepository.findOne.mockResolvedValue({ id: '1', organizationId: 'org1', userId: 'user1' });
      mockDealRepository.create.mockReturnValue({ id: '1', ...createDealDto });
      mockDealRepository.save.mockResolvedValue({ id: '1', ...createDealDto });

      const result = await service.create(createDealDto, 'org1', 'user1');

      expect(result).toHaveProperty('id');
      expect(mockMemberRepository.findOne).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not a member', async () => {
      const createDealDto = {
        title: 'Test Deal',
        customerId: 'cust1',
      };

      mockMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDealDto, 'org1', 'user1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStatistics', () => {
    it('should return deal statistics', async () => {
      mockMemberRepository.findOne.mockResolvedValue({ id: '1' });
      mockDealRepository.count.mockResolvedValue(10);
      mockDealRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue({ total: 50000 }),
      });

      const result = await service.getStatistics('org1', 'user1');

      expect(result).toHaveProperty('totalDeals');
      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('dealsByStage');
    });
  });

  describe('findOne', () => {
    it('should return a deal', async () => {
      const deal = { id: '1', title: 'Test Deal' };
      
      mockMemberRepository.findOne.mockResolvedValue({ id: '1' });
      mockDealRepository.findOne.mockResolvedValue(deal);

      const result = await service.findOne('1', 'org1', 'user1');

      expect(result).toEqual(deal);
    });

    it('should throw NotFoundException if deal not found', async () => {
      mockMemberRepository.findOne.mockResolvedValue({ id: '1' });
      mockDealRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', 'org1', 'user1')).rejects.toThrow(NotFoundException);
    });
  });
});
