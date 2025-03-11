import { IsEmail, IsEnum, IsUUID } from "class-validator";
import { Role } from "../../enums/role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto{
    @ApiProperty({
        example: 'email@email.com'
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: 'user'
    })
    @IsEnum(Role)
    role: Role
}