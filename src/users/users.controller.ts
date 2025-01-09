import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../enums/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async getUser(@Param('id') id: string){
    return this.usersService.getOne(id)
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async getUsers(){
    return this.usersService.list()
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete()
  async deleteUser(@Param('id') id: string){
    return this.usersService.delete(id)
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put()
  async updateUser(@Body() data: UserDto, @Param('id') id: string){
    return this.usersService.update(data, id)
  }
}
