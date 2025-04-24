import { ApiProperty } from "@nestjs/swagger";

export class LoginResponse{
    @ApiProperty({
        example: 'token'
    })
    access_token: string
}