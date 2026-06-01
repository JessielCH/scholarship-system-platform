import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';

const privateKeyPath = process.env.PRIVATE_KEY_PATH || path.join(__dirname, '../../keys/private.pem');
const publicKeyPath = process.env.PUBLIC_KEY_PATH || path.join(__dirname, '../../keys/public.pem');

let privateKey = '';
let publicKey = '';
try {
  privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  publicKey = fs.readFileSync(publicKeyPath, 'utf8');
} catch(e) {
  console.warn('Keys not found on disk, checking env vars or defaulting to empty');
  privateKey = process.env.JWT_PRIVATE_KEY || '';
  publicKey = process.env.JWT_PUBLIC_KEY || '';
}

@Module({
  imports: [
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
