import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases/auth-credentials.use-case';
import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';
import { KeycloakUseCaseException } from '@core/@shared/infrastructure/adapter/identify-and-access/keycloak/exception/keycloak-error.exception';

import { UserGetUserUseCase } from './user-get-user.use-case';
import { UserSendCredentialResetUseCase } from './user-send-credential-reset.use-case';
import { UserSetPasswordUseCase } from './user-set-password.use-case';
import { UserCreateInput } from '../dtos/user-create.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserCreateUseCase {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private authCredentialsUseCase: AuthCredentialsUseCase,
    private userGetUserUseCase: UserGetUserUseCase,
    private userSetPasswordUseCase: UserSetPasswordUseCase,
    private userSendCredentialResetUseCase: UserSendCredentialResetUseCase,
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

  async execute(userDto: UserCreateInput): Promise<AxiosResponse<User>> {
    const {
      firstName,
      lastName,
      email,
      passwordCurrent,
      deviceToken,
      emailVerified = false,
    } = userDto;

    const payload = {
      username: email,
      firstName,
      lastName,
      email,
      groups: ['/User'],
      emailVerified,
      enabled: true,
      attributes: {
        locale: ['pt-BR'],
        device_token: '',
      },
      requiredActions: ['terms_and_conditions', 'VERIFY_EMAIL'],
    };

    if (deviceToken) {
      payload.attributes.device_token = deviceToken;
    }

    const { access_token } = await lastValueFrom(
      this.authCredentialsUseCase.execute(),
    );

    if (access_token) {
      return await lastValueFrom(
        this.httpService.post(this.url, payload, {
          headers: {
            authorization: `Bearer ${access_token}`,
          },
        }),
      )
        .then(async (res) => {
          const user = await this.userGetUserUseCase.execute({ email });
          if (user) {
            await this.userSetPasswordUseCase.execute(user.id, passwordCurrent);
            this.userSendCredentialResetUseCase.execute(user.id, [
              'terms_and_conditions',
              'VERIFY_EMAIL',
            ]);

            if (!emailVerified) {
              throw Exception.new({
                code: Code.BAD_REQUEST.code,
                overrideMessage: `Olá ${user.firstName}, para efetivar o seu cadastro verifique o seu e-mail ${user.email}.`,
              });
            }
            return user;
          }
          return res.data;
        })
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
