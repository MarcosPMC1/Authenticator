import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Users } from './entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { BullModule } from '@nestjs/bull';
import { AuthConsumer } from './auth.consumer';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

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
    MailerModule.forRoot({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      transport: {
        host: 'live.smtp.mailtrap.io',
        port: 587,
        secure: true,
        auth: {
          user: 'api',
          pass: '69f8b37722d986d94218d2b2771cca46',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@smtp.mailtrap.live>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
    BullModule.registerQueue({ name: 'mail' })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthConsumer],
})
export class AuthModule {}
