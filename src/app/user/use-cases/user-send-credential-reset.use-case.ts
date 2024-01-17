import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases';

@Injectable()
export class UserSendCredentialResetUseCase {
  logger = new Logger(UserSendCredentialResetUseCase.name);

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

    return (
      this.httpService.axiosRef
        .put(url, actions, {
          headers: {
            authorization: `Bearer ${access_token}`,
          },
        })
        .then((response) => response.data)
        // .catch((e) => new KeycloakUseCaseException(e))
        .catch(() => this.logger.error('E-mail not sent to user'))
    );
  }
}
