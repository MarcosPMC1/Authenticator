import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>
    ) {}

    async list(){
        return this.userRepository.find()
    }

    async getOne(id: string){
        const user = await this.userRepository.findOne({ where: { id } })
        if(!user) throw new NotFoundException('User Not Found')
        return user
    }

    async delete(id: string){
        await this.userRepository.softDelete({ id })
        return { msg: 'User successfully deleted' } 
    }

    async update(data: UserDto, id: string){
        const user = await this.userRepository.findOne({ where: { id } })
        if(!user) throw new NotFoundException('User Not Found')
        await this.userRepository.update(id, data)
        return { msg: 'User has been updated' } 
    }
}
