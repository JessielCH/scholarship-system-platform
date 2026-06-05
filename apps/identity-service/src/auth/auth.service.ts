import { Injectable, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    this.logger.log('Checking default users...');
    
    const studentEmail = 'student@uce.edu.ec';
    if (!(await this.userRepository.findOne({ where: { email: studentEmail } }))) {
      const salt = await bcrypt.genSalt(10);
      await this.userRepository.save(this.userRepository.create({
        email: studentEmail,
        passwordHash: await bcrypt.hash('student123', salt),
        role: 'STUDENT',
      }));
      this.logger.log(`Seeded ${studentEmail}`);
    }

    const adminEmail = 'admin@uce.edu.ec';
    if (!(await this.userRepository.findOne({ where: { email: adminEmail } }))) {
      const salt = await bcrypt.genSalt(10);
      await this.userRepository.save(this.userRepository.create({
        email: adminEmail,
        passwordHash: await bcrypt.hash('admin123', salt),
        role: 'ADMIN',
      }));
      this.logger.log(`Seeded ${adminEmail}`);
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '2h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async register(body: any) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: body.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(body.password, salt);

    const user = this.userRepository.create({
      email: body.email,
      passwordHash,
      role: body.role || 'STUDENT',
    });

    await this.userRepository.save(user);

    return { message: 'User registered successfully', email: user.email };
  }
}
