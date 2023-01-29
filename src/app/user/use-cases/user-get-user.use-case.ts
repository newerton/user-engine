import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { AuthCredentialsUseCase } from '@app/auth/use-cases/auth-credentials.use-case';
import { KeycloakUseCaseException } from '@core/@shared/infrastructure/adapter/identify-and-access/keycloak/exception/keycloak-error.exception';

import { UserSearchInput } from '../dtos/user-search.dto';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserGetUserUseCase {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private authCredentialsUseCase: AuthCredentialsUseCase,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  url = `${this.baseInternalUrl}/admin/realms/${this.realm}/users`;

  async execute({
    firstName,
    lastName,
    email,
  }: UserSearchInput): Promise<User | false> {
    const url = `${this.url}`;
    let query = '';
    if (firstName) {
      query += `&firstName=${firstName}`;
    }
    if (lastName) {
      query += `&lastName=${lastName}`;
    }
    if (email) {
      query += `&email=${email}`;
    }

    if (query.length > 0) {
      query = query.substring(1);
    }

    const { access_token } = await lastValueFrom(
      this.authCredentialsUseCase.execute(),
    );

    const users = await lastValueFrom(
      this.httpService.get(`${url}?${query}`, {
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    )
      .then(async (res) => res.data)
      .catch((e) => new KeycloakUseCaseException(e));

    if (users && users.length > 0) {
      const user = users[0];
      return user;
    }

    return false;
  }
}
