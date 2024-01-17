import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class UserSendCredentialResetUseCase {
  constructor(
    @Inject('NOTIFICATION_SERVICE_KAFKA')
    private readonly clientKafka: ClientKafka,
  ) {}

  execute(userId: string, actions: Array<string>): void {
    this.clientKafka.emit('email.users.send-credential-confirm', {
      userId,
      actions,
    });
  }
}
