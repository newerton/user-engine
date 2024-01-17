import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { AuthCredentials } from '../types';

@Injectable()
export class AuthCredentialsUseCase {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  execute(): Observable<AuthCredentials> {
    return this.client.send('auth.credentials', {});
  }
}
