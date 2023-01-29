import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases/auth-credentials.use-case';
import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';
import { KeycloakUseCaseException } from '@core/@shared/infrastructure/adapter/identify-and-access/keycloak/exception/keycloak-error.exception';

import { UserGetAccessTokenInfoUseCase } from './user-get-access-token-info.use-case';
import { UserCreateInput } from '../dtos/user-create.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserUpdateUseCase {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private userGetAccessTokenInfoUseCase: UserGetAccessTokenInfoUseCase,
    private authCredentialsUseCase: AuthCredentialsUseCase,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  certPublicKey = this.configService.get<string>(
    'keycloak.certPublicKey',
  ) as string;
  url = `${this.baseInternalUrl}/admin/realms/${this.realm}/users`;
  options = {
    headers: {},
  };

  async execute(
    userDto: UserCreateInput,
    headers: AxiosRequestHeaders,
  ): Promise<AxiosResponse<User>> {
    const { firstName, lastName, email, attributes } = userDto;

    const { sub } = await this.userGetAccessTokenInfoUseCase.execute(headers);

    const payload = {} as UserCreateInput;

    if (firstName) {
      payload.firstName = firstName;
    }

    if (lastName) {
      payload.lastName = lastName;
    }

    if (email) {
      payload.email = email;
    }

    if (attributes) {
      payload.attributes = attributes;
    }

    const { access_token } = await lastValueFrom(
      this.authCredentialsUseCase.execute(),
    );

    if (sub && access_token) {
      this.options.headers['authorization'] = `Bearer ${access_token}`;
      const url = `${this.url}/${sub}`;
      return await lastValueFrom(
        this.httpService.put(url, payload, this.options),
      )
        .then(async (res) => res.data)
        .catch((e) => {
          new KeycloakUseCaseException(e);
        });
    }

    throw Exception.new({
      code: Code.BAD_REQUEST,
      overrideMessage: 'Access token invalid',
    });
  }
}
