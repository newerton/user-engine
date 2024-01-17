import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases/auth-credentials.use-case';
import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';

import { UserGetUserUseCase } from './user-get-user.use-case';
import { UserSearchInput } from '../dtos/user-search.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserFindOneUseCase {
  constructor(
    private authCredentialsUseCase: AuthCredentialsUseCase,
    private userGetUserUseCase: UserGetUserUseCase,
  ) {}

  async execute({
    firstName,
    lastName,
    email,
  }: UserSearchInput): Promise<User> {
    const { access_token } = await lastValueFrom(
      this.authCredentialsUseCase.execute(),
    );
    if (access_token) {
      const user = await this.userGetUserUseCase.execute({
        firstName,
        lastName,
        email,
      });
      if (user) {
        return user;
      }
      throw Exception.new({
        code: Code.BAD_REQUEST.code,
        overrideMessage: 'User not found',
      });
    }
    throw Exception.new({
      code: Code.BAD_REQUEST.code,
      overrideMessage: 'No access token',
    });
  }
}
