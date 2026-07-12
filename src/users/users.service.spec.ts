import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const updateUserDto = { name: 'Updated Name' };
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue({ ...user, ...updateUserDto });

      const result = await service.update('1', updateUserDto, '1');

      expect(result).toHaveProperty('name', 'Updated Name');
    });

    it('should throw ForbiddenException if updating another user', async () => {
      const updateUserDto = { name: 'Updated Name' };

      await expect(service.update('1', updateUserDto, '2')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete user account', async () => {
      const user = { id: '1', email: 'test@example.com' };
      
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await service.remove('1', '1');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw ForbiddenException if deleting another user', async () => {
      await expect(service.remove('1', '2')).rejects.toThrow(ForbiddenException);
    });
  });
});
