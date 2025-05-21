import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { RegistrateAuthDto } from './dto/registrate-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private jwtService: JwtService,
  ) {}

  async registrate(data: RegistrateAuthDto) {
    const { id, email, username } = await this.usersRepository
      .save(
        this.usersRepository.create({
          email: data.email,
          password: bcrypt.hashSync(data.password, 11),
          username: data.username,
        }),
      )
      .catch((err) => {
        if (err.code == '23505') {
          throw new BadRequestException('User already exists');
        }
        throw new InternalServerErrorException();
      });
    return { id, email, username };
  }

  async login(data: LoginAuthDto) {
    const user = await this.usersRepository.findOne({
      where: { email: data.email },
    });
    if (!user || !bcrypt.compareSync(data.password, user.password)) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email, username: user.username, roles: user.role };

    return this.generateTokens(payload);
  }

  async generateTokens(payload: any) {
    const access_token = this.jwtService.sign(payload, {
      algorithm: 'RS256',
      expiresIn: '1h',
    });
    const refresh_token = this.jwtService.sign(payload, {
      algorithm: 'RS256',
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }
}
