import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { compareSync, hashSync } from 'bcrypt';
import { lastValueFrom } from 'rxjs';
import { EntryPayload } from './entry.payload';
import { ReturnModel } from './return.model';
import { UserModel } from './repository/user.model';
import { UserRepository } from './repository/user.repository';
import { TokensModel } from './tokens.model';

@Injectable()
export class UserService {
  constructor(
    readonly userRepository: UserRepository,
    @Inject("USER_SERVICE") private client: ClientProxy,
  ) {}

  async register(data: EntryPayload): Promise<ReturnModel> {
    if (this.userRepository.exists(data.email))
      throw new HttpException(
        'User with such email already exists',
        HttpStatus.BAD_REQUEST,
      );

    const hashPassword = hashSync(data.password, 8);
    this.userRepository.add(data.email, hashPassword);

    const tokens: TokensModel = await lastValueFrom(this.client.send<TokensModel, string>("generate-and-save-tokens", data.email));
    return { ...tokens, user: {email: data.email} };
  }

  async login(data: EntryPayload): Promise<ReturnModel> {
    if (!this.userRepository.exists(data.email))
      throw new HttpException('User is not found', HttpStatus.BAD_REQUEST);

    const user: UserModel = this.userRepository.find(data.email);

    const isPassEquals = compareSync(data.password, user.password);
    if (!isPassEquals)
      throw new HttpException("Password isn't correct", HttpStatus.BAD_REQUEST);

    const tokens: TokensModel = await lastValueFrom(this.client.send<TokensModel, string>("generate-and-save-tokens", data.email));

    return { ...tokens, user: { email: data.email} };
  }
}
