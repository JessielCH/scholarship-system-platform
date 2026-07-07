import {
  Injectable,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
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
    if (
      !(await this.userRepository.findOne({ where: { email: studentEmail } }))
    ) {
      const salt = await bcrypt.genSalt(10);
      await this.userRepository.save(
        this.userRepository.create({
          id: 'student_default_0',
          email: studentEmail,
          passwordHash: await bcrypt.hash('student123', salt),
          role: 'STUDENT',
        }),
      );
      this.logger.log(`Seeded ${studentEmail}`);
    }

    const adminEmail = 'admin@uce.edu.ec';
    if (
      !(await this.userRepository.findOne({ where: { email: adminEmail } }))
    ) {
      const salt = await bcrypt.genSalt(10);
      await this.userRepository.save(
        this.userRepository.create({
          id: 'admin_default_0',
          email: adminEmail,
          passwordHash: await bcrypt.hash('admin123', salt),
          role: 'ADMIN',
        }),
      );
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
      role: 'STUDENT',
    });

    await this.userRepository.save(user);

    return { message: 'User registered successfully', email: user.email };
  }

  async registerAdmin(body: any) {
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
      role: 'ADMIN',
    });

    await this.userRepository.save(user);

    return { message: 'Admin user registered successfully', email: user.email };
  }

  async bulkRegister(body: any) {
    if (!body.users || !Array.isArray(body.users) || body.users.length === 0) {
      throw new BadRequestException('An array of users is required');
    }

    const defaultPassword = body.defaultPassword || 'student123';
    this.logger.log(
      `Starting bulk register for ${body.users.length} users... generating shared hash.`,
    );

    // Use a single hash for all users in the batch to avoid CPU exhaustion
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    const usersToInsert = body.users.map((u: any) => {
      return this.userRepository.create({
        id: u.id,
        email: u.email,
        passwordHash: passwordHash,
        role: u.role || 'STUDENT',
      });
    });

    // We can use save() with an array, which TypeORM handles efficiently, or insert() for even faster non-cascading bulk inserts.
    // We use insert but wrap in try-catch to ignore duplicates or handle them.
    // For upserting (if they already exist), we can use queryBuilder.
    try {
      this.logger.log(`Executing bulk insert in chunks of 1000...`);
      for (let i = 0; i < usersToInsert.length; i += 1000) {
        const chunk = usersToInsert.slice(i, i + 1000);
        await this.userRepository
          .createQueryBuilder()
          .insert()
          .into(User)
          .values(chunk)
          .orIgnore() // Ignore on conflict
          .execute();
      }
      this.logger.log(`Bulk insert completed.`);
    } catch (e: any) {
      this.logger.error(`Error in bulk insert: ${e.message}`);
      throw new BadRequestException('Error during bulk insertion');
    }

    return {
      message: `Successfully processed ${body.users.length} users for bulk registration`,
    };
  }
}
