import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;

  const mockCustomerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: getRepositoryToken(OrganizationMember),
          useValue: mockMemberRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createCustomerDto = {
        name: 'Test Customer',
        email: 'customer@example.com',
        phone: '1234567890',
      };

      mockMemberRepository.findOne.mockResolvedValue({ id: '1', organizationId: 'org1', userId: 'user1' });
      mockCustomerRepository.create.mockReturnValue({ id: '1', ...createCustomerDto });
      mockCustomerRepository.save.mockResolvedValue({ id: '1', ...createCustomerDto });

      const result = await service.create(createCustomerDto, 'org1', 'user1');

      expect(result).toHaveProperty('id');
      expect(mockMemberRepository.findOne).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not a member', async () => {
      const createCustomerDto = {
        name: 'Test Customer',
        email: 'customer@example.com',
      };

      mockMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createCustomerDto, 'org1', 'user1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const query = { page: 1, limit: 10 };
      
      mockMemberRepository.findOne.mockResolvedValue({ id: '1' });
      mockCustomerRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll('org1', 'user1', query);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
    });
  });

  describe('findOne', () => {
    it('should return a customer', async () => {
      const customer = { id: '1', name: 'Test Customer' };
      
      mockMemberRepository.findOne.mockResolvedValue({ id: '1' });
      mockCustomerRepository.findOne.mockResolvedValue(customer);

      const result = await service.findOne('1', 'org1', 'user1');

      expect(result).toEqual(customer);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockMemberRepository.findOne.mockResolvedValue({ id: '1' });
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', 'org1', 'user1')).rejects.toThrow(NotFoundException);
    });
  });
});
