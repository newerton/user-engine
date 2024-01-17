import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders } from 'axios';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases/auth-credentials.use-case';
import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';

import { UserGetAccessTokenInfoUseCase } from './user-get-access-token-info.use-case';
import { UserSetPasswordUseCase } from './user-set-password.use-case';
import { UserChangePasswordInput } from '../dtos/user-change-password.dto';

@Injectable()
export class UserChangePasswordUseCase {
  constructor(
    private authCredentialsUseCase: AuthCredentialsUseCase,
    private userGetAccessTokenInfoUseCase: UserGetAccessTokenInfoUseCase,
    private userSetPasswordUseCase: UserSetPasswordUseCase,
  ) {}

  options = {
    headers: {},
  };

  async execute(
    passwords: UserChangePasswordInput,
    headers: AxiosRequestHeaders,
  ): Promise<void> {
    const { passwordCurrent } = passwords;

    const { sub } = await this.userGetAccessTokenInfoUseCase.execute(headers);

    const { access_token } = await lastValueFrom(
      this.authCredentialsUseCase.execute(),
    );

    if (sub && access_token) {
      return await this.userSetPasswordUseCase.execute(
        sub.toString(),
        passwordCurrent,
      );
    }

    throw Exception.new({
      code: Code.BAD_REQUEST.code,
      overrideMessage: 'Access token invalid',
    });
  }
}
