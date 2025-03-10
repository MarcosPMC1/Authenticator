import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    example: "example@example.com"
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "teste123"
  })
  @IsString()
  password: string;
}
