import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrateAuthDto } from './dto/registrate-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registrate')
  registrateAuth(@Body() data: RegistrateAuthDto) {
    return this.authService.registrate(data);
  }

  @Post()
  loginAuth(@Body() data: LoginAuthDto) {
    return this.authService.login(data);
  }
}
