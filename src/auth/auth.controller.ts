import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponse } from './dto/login-response.dto';
import { RegistrateResponse } from './dto/registrate-response.dto';
import { RegistrateAuthDto } from './dto/registrate-auth.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Authenticate')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'Success registrate user',  
    type: RegistrateResponse
  })
  @Post('registrate')
  registrateAuth(@Body() data: RegistrateAuthDto) {
    return this.authService.registrate(data);
  }

  @ApiCreatedResponse({
    description: 'Sucess login',
    type: LoginResponse
  })
  @Post()
  loginAuth(@Body() data: LoginAuthDto) {
    return this.authService.login(data);
  }

  @UseGuards(AuthGuard)
  @ApiCreatedResponse({
    description: 'Success refresh token',
    type: LoginResponse
  })
  @Post('refresh')
  refreshToken(@Req() req) {
    const user = req.user as any;
    return this.authService.generateTokens(user);
  }

}
