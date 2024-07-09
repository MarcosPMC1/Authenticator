import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Users } from './entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Users ]),
    JwtModule.register({
      global: true,
      privateKey: readFileSync('./key').toString(),
      publicKey: readFileSync('./key.pub').toString(),
      signOptions: {
        expiresIn: '1h',
      },
    }),
    BullModule.registerQueue({ name: 'email-verification' })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
