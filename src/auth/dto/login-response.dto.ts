import { ApiProperty } from "@nestjs/swagger";

export class LoginResponse{
    @ApiProperty({
        example: 'token',
    })
    access_token: string;

    @ApiProperty({
        example: 'token',
    })
    refresh_token: string;
}