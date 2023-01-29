import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases/auth-credentials.use-case';
import { KeycloakUseCaseException } from '@core/@shared/infrastructure/adapter/identify-and-access/keycloak/exception/keycloak-error.exception';

@Injectable()
export class UserSetPasswordUseCase {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private authCredentialsUseCase: AuthCredentialsUseCase,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseInternalUrl}/admin/realms/${this.realm}/users`;

  async execute(userId: string, password: string): Promise<void> {
    const payload = { type: 'password', value: password, temporary: false };
    const url = `${this.url}/${userId}/reset-password`;

    const { access_token } = await lastValueFrom(
      this.authCredentialsUseCase.execute(),
    );
    return await lastValueFrom(
      this.httpService.put(url, payload, {
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    )
      .then(async (res) => res.data)
      .catch((e) => new KeycloakUseCaseException(e));
  }
}
