import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authenticate')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registrate')
  registrateAuth(@Body() data: LoginAuthDto) {
    return this.authService.registrate(data);
  }

  @Post()
  loginAuth(@Body() data: LoginAuthDto) {
    return this.authService.login(data);
  }
}
