import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KeycloakConnectModule } from 'nest-keycloak-connect';

import keycloakConfig from '@app/@common/infrastructure/config/keycloak.config';
import { AuthModule } from '@app/auth/auth.module';
import { KafkaServerConfig } from '@core/@shared/infrastructure/config/env';

import {
  UserChangePasswordController,
  UserCreateController,
  UserFindByIdController,
  UserFindOneController,
  UserForgotPasswordController,
  UserMeController,
  UserUpdateController,
} from './controllers';
import {
  UserChangePasswordUseCase,
  UserCreateUseCase,
  UserFindByIdUseCase,
  UserFindOneUseCase,
  UserForgotPasswordUseCase,
  UserGetAccessTokenInfoUseCase,
  UserGetUserUseCase,
  UserMeUseCase,
  UserSendCredentialResetUseCase,
  UserSetPasswordUseCase,
  UserUpdateUseCase,
} from './use-cases';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [keycloakConfig],
    }),
    HttpModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE_KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'notification',
            brokers: [
              `${KafkaServerConfig.BROKER_HOST}:${KafkaServerConfig.BROKER_PORT}`,
            ],
          },
        },
      },
    ]),
    KeycloakConnectModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        debug: config.get<string>('keycloak.debug'),
        authServerUrl: config.get<string>('keycloak.baseInternalUrl'),
        realm: config.get<string>('keycloak.realm') as string,
        clientId: config.get<string>('keycloak.clientId'),
        secret: config.get<string>('keycloak.secret') as string,
      }),
    }),
    AuthModule,
  ],
  controllers: [
    UserChangePasswordController,
    UserCreateController,
    UserFindByIdController,
    UserFindOneController,
    UserForgotPasswordController,
    UserMeController,
    UserUpdateController,
  ],
  providers: [
    UserChangePasswordUseCase,
    UserCreateUseCase,
    UserFindByIdUseCase,
    UserFindOneUseCase,
    UserForgotPasswordUseCase,
    UserGetAccessTokenInfoUseCase,
    UserGetUserUseCase,
    UserMeUseCase,
    UserSendCredentialResetUseCase,
    UserSetPasswordUseCase,
    UserUpdateUseCase,
  ],
})
export class UserModule {}
