import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../enums/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { UserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiOkResponse({ 
    description: 'Get one user',
    type: UserDto
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async getUser(@Param('id') id: string){
    return this.usersService.getOne(id)
  }

  @ApiOkResponse({ 
    description: 'List all users',
    type: UserDto,
    isArray: true
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async getUsers(){
    return this.usersService.list()
  }

  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiOkResponse({
    description: 'Successfully deleted the user',
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete()
  async deleteUser(@Param('id') id: string){
    return this.usersService.delete(id)
  }

  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiOkResponse({
    description: 'Successfully updated the user',
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put()
  async updateUser(@Body() data: UserDto, @Param('id') id: string){
    return this.usersService.update(data, id)
  }
}
