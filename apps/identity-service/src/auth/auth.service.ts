import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // Basic mock implementation for S2 validation
    if (email === 'test@uce.edu.ec' && pass === 'password') {
      return { id: 'uuid-1234', email, role: 'STUDENT' };
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '2h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    };
  }

  async register(body: any) {
    // Mock register logic
    return { message: 'User registered successfully', email: body.email };
  }
}
