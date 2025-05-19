import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { AuthGuard } from "../guards/auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Role } from "../enums/role.enum";
import { Roles } from "../enums/roles.decorator";
import { UserTenantDto } from "./dto/user-tenant.dto";
import { CreateTenantDto } from "./dto/create-tenant.dto";

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async getTenants() {
    return this.tenantService.getAllTenants();
  }

  @UseGuards(AuthGuard)
  @Post('invite')
  async addUserToTenant(@Body() data: UserTenantDto) {
    return this.tenantService.addUserToTenant(data);
  }

  @UseGuards(AuthGuard)
  @Delete()
  async deleteUserTenant(@Body() data: UserTenantDto) {
    return this.tenantService.deleteUserTenant(data);
  }

  @Post()
  async createTenant(@Body() tenantData: CreateTenantDto) {
    return this.tenantService.createTenant(tenantData);
  }
}