import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases/auth-credentials.use-case';
import { KeycloakUseCaseException } from '@core/@shared/infrastructure/adapter/identify-and-access/keycloak/exception/keycloak-error.exception';

@Injectable()
export class UserSendCredentialResetUseCase {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private authCredentialsUseCase: AuthCredentialsUseCase,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseInternalUrl}/admin/realms/${this.realm}/users`;

  async execute(
    userId: string,
    actions: Array<string>,
  ): Promise<AxiosResponse<any>> {
    const url = `${this.url}/${userId}/execute-actions-email?lifespan=43200`;

    const { access_token } = await lastValueFrom(
      this.authCredentialsUseCase.execute(),
    );
    return await lastValueFrom(
      this.httpService.put(url, actions, {
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    )
      .then(async (res) => res.data)
      .catch((e) => new KeycloakUseCaseException(e));
  }
}
