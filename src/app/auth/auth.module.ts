import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ApiServerConfig } from '@core/@shared/infrastructure/config/env/api-server.config';

import { AuthCredentialsUseCase } from './use-cases/auth-credentials.use-case';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: ApiServerConfig.AUTH_ENGINE_PORT,
        },
      },
    ]),
  ],
  providers: [AuthCredentialsUseCase],
  exports: [AuthCredentialsUseCase],
})
export class AuthModule {}
