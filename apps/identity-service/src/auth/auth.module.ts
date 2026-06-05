import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

import { User } from '../users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

let privateKey = process.env.JWT_PRIVATE_KEY
  ? process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n')
  : '';
let publicKey = process.env.JWT_PUBLIC_KEY
  ? process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n')
  : '';

if (!privateKey || !publicKey) {
  try {
    privateKey = fs.readFileSync(
      path.join(process.cwd(), 'keys', 'private.pem'),
      'utf8',
    );
    publicKey = fs.readFileSync(
      path.join(process.cwd(), 'keys', 'public.pem'),
      'utf8',
    );
  } catch {
    console.warn('Keys not found, using fallback keys or it will fail in prod');
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      privateKey: privateKey,
      publicKey: publicKey,
      signOptions: { algorithm: 'RS256' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
