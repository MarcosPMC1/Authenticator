import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegistrateAuthDto } from './dto/registrate-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private jwtService: JwtService
  ) {}
  
  async registrate(data: RegistrateAuthDto){
    const { id, email } = await this.usersRepository.save(this.usersRepository.create({
      email: data.email,
      password: bcrypt.hashSync(data.password, 11)
    }))
    return { id, email }
  }

  async login(data: LoginAuthDto){
    const user = await this.usersRepository.findOne({ where: { email: data.email } })
    if(!user || !bcrypt.compareSync(data.password, user.password)){
      throw new UnauthorizedException()
    }

    const payload = { sub: user.id, username: user.email }

    return {
      access_token: this.jwtService.signAsync(payload, { algorithm: 'RS256' })
    }
  }
}
