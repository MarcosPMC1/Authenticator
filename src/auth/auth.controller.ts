import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { LoginResponse } from './dto/login-response.dto';
import { RegistrateResponse } from './dto/registrate-response.dto';

@ApiTags('Authenticate')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'Success registrate user',  
    type: RegistrateResponse
  })
  @Post('registrate')
  registrateAuth(@Body() data: LoginAuthDto) {
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
}
