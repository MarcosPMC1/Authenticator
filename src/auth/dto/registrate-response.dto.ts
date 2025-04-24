import { ApiProperty } from "@nestjs/swagger";

export class RegistrateResponse{
    @ApiProperty({
        example: '29f7a642-d49b-4c2f-b109-d05c2bdf16d5'
    })
    id: string

    @ApiProperty({
        example: 'email@email.com'
    })
    email: string
}