import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const validUser = { id: 1, email: 'test@example.com', role: 'STUDENT' };
      const tokenResponse = { access_token: 'valid-jwt' };

      mockAuthService.validateUser.mockResolvedValue(validUser);
      mockAuthService.login.mockReturnValue(tokenResponse);

      const result = await controller.login(loginDto as any);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(validUser);
      expect(result).toEqual(tokenResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = { email: 'wrong@example.com', password: 'bad' };
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto as any)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
