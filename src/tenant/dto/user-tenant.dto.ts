import { IsUUID } from "class-validator"

export class UserTenantDto {
  @IsUUID()
  userId: string

  @IsUUID()
  tenantId: string
}