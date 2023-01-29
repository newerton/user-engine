import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { AuthCredentials } from '../types/auth-credentials.type';

@Injectable()
export class AuthCredentialsUseCase {
  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
    private configService: ConfigService,
  ) {}

  baseInternalUrl = this.configService.get<string>('keycloak.baseInternalUrl');
  realm = this.configService.get<string>('keycloak.realm');
  certPublicKey = this.configService.get<string>(
    'keycloak.certPublicKey',
  ) as string;
  url = `${this.baseInternalUrl}/admin/realms/${this.realm}/users`;
  urlUserInfo = `${this.baseInternalUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
  options = {
    headers: {} as Headers,
  };

  execute(): Observable<AuthCredentials> {
    return this.client.send('auth.credentials', {});
  }
}
