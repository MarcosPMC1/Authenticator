import { Transform } from "class-transformer";
import { IsString } from "class-validator";

export class CreateTenantDto {
  @IsString()
  @Transform(({ value }) => value.replace(/[^\w\s]/gi, ''))
  name: string;
}