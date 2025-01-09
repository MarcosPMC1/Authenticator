import { IsEmail, IsEnum, IsUUID } from "class-validator";
import { Role } from "../../enums/role.enum";

export class UserDto{
    @IsEmail()
    email: string

    @IsEnum(Role)
    role: Role
}