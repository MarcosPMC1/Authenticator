import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        username: configService.getOrThrow('POSTGRES_USER'),
        database: configService.getOrThrow('POSTGRES_DATABASE'),
        password: configService.getOrThrow('POSTGRES_PASSWORD'),
        host: configService.getOrThrow('POSTGRES_HOST'),
        port: configService.getOrThrow('POSTGRES_PORT'),
        type: 'postgres',
        autoLoadEntities: true,
        logging: true,
        synchronize: true
      }),
    }),
    JwtModule.register({
      global: true,
      privateKey: readFileSync('/usr/keys/key').toString(),
      publicKey: readFileSync('/usr/keys/key.pub').toString(),
      signOptions: {
        expiresIn: '15m',
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
