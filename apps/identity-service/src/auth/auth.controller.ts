import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({
    schema: {
      example: { email: 'student@uce.edu.ec', password: 'password123' },
    },
  })
  @ApiResponse({ status: 200, description: 'Successful login' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    schema: {
      example: {
        email: 'student@uce.edu.ec',
        password: 'password123',
        role: 'STUDENT',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered' })
  @ApiResponse({ status: 400, description: 'Email in use or missing fields' })
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('bulk-register')
  @ApiOperation({ summary: 'Register multiple users efficiently' })
  @ApiBody({
    schema: {
      example: {
        defaultPassword: 'student123',
        users: [{ id: 'usr-1', email: 'stu1@uce.edu.ec', role: 'STUDENT' }],
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Users registered' })
  async bulkRegister(@Body() body: any) {
    return this.authService.bulkRegister(body);
  }
}
