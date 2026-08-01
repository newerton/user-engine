import { Inject, Injectable } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

import type { AuthCredentials } from '../types';

@Injectable()
export class AuthCredentialsUseCase {
  constructor(@Inject('AUTH_SERVICE') private readonly _client: ClientProxy) {}

  execute(): Observable<AuthCredentials> {
    return this.client.send('auth.credentials', {});
  }
}
