import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases/auth-credentials.use-case';
import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';
import { KeycloakUseCaseException } from '@core/@shared/infrastructure/adapter/identify-and-access/keycloak/exception/keycloak-error.exception';

import { User } from '../schemas/user.schema';

@Injectable()
export class UserFindByIdUseCase {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private authCredentialsUseCase: AuthCredentialsUseCase,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseInternalUrl}/admin/realms/${this.realm}/users`;
  options = {
    headers: {},
  };

  async execute({ id }: { id: string }): Promise<User> {
    const { access_token } = await lastValueFrom(
      this.authCredentialsUseCase.execute(),
    );
    if (access_token) {
      this.options.headers['authorization'] = `Bearer ${access_token}`;
      const url = `${this.url}/${id}`;
      return await lastValueFrom(this.httpService.get(url, this.options))
        .then(async (res) => res.data)
        .catch((e) => {
          new KeycloakUseCaseException(e);
        });
    }
    throw Exception.new({
      code: Code.BAD_REQUEST.code,
      overrideMessage: 'No access token',
    });
  }
}
