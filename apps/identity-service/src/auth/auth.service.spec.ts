import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  genSalt: jest.fn().mockResolvedValue('test_salt_123'),
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockQueryBuilder: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn((dto) => Promise.resolve({ ...dto, id: 'saved_id_1' })),
    createQueryBuilder: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-jwt-token'),
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ raw: [] }),
    };
    mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should seed default admin and student users if not found during onModuleInit', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      await service.onModuleInit();
      expect(mockUserRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should skip seeding if default users already exist in db', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing_id' });
      await service.onModuleInit();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      const user = {
        email: 'test@example.com',
        passwordHash: 'hashedPass',
        role: 'STUDENT',
      };
      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({ email: 'test@example.com', role: 'STUDENT' });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPass');
    });

    it('should return null if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password mismatch', async () => {
      const user = { email: 'test@example.com', passwordHash: 'hashedPass' };
      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token for the given user', () => {
      const user = { email: 'test@example.com', id: 1, role: 'STUDENT' };
      const result = service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@example.com', sub: 1, role: 'STUDENT' },
        { expiresIn: '2h' },
      );
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-jwt-token',
      });
    });
  });

  describe('register', () => {
    it('should register a new student user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const res = await service.register({ email: 'new@example.com', password: 'pass', role: 'STUDENT' });
      expect(res).toEqual({ message: 'User registered successfully', email: 'new@example.com' });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email or password missing', async () => {
      await expect(service.register({ email: 'no-pass@example.com' })).rejects.toThrow();
    });

    it('should throw BadRequestException if user email already exists in db', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing' });
      await expect(service.register({ email: 'exist@example.com', password: '123' })).rejects.toThrow();
    });
  });

  describe('bulkRegister', () => {
    it('should process users array and insert in database', async () => {
      const users = [{ id: '1', email: 'u1@uce.edu.ec' }, { id: '2', email: 'u2@uce.edu.ec' }];
      const res = await service.bulkRegister({ users });
      expect(res).toEqual({ message: `Successfully processed 2 users for bulk registration` });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should throw BadRequestException if users list is not array or empty', async () => {
      await expect(service.bulkRegister({ users: [] })).rejects.toThrow();
    });

    it('should catch query builder errors and throw BadRequestException', async () => {
      mockQueryBuilder.execute.mockRejectedValue(new Error('DB failure'));
      const users = [{ id: '1', email: 'u1@uce.edu.ec' }];
      await expect(service.bulkRegister({ users })).rejects.toThrow('Error during bulk insertion');
    });
  });
});
