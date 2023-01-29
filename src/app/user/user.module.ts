import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakConnectModule } from 'nest-keycloak-connect';

import keycloakConfig from '@app/@common/infrastructure/config/keycloak.config';
import { AuthModule } from '@app/auth/auth.module';

import { UserChangePasswordController } from './controllers/user-change-password.controller';
import { UserCreateController } from './controllers/user-create.controller';
import { UserFindByIdController } from './controllers/user-find-by-id.controller';
import { UserFindOneController } from './controllers/user-find-one.controller';
import { UserForgotPasswordController } from './controllers/user-forgot-password.controller';
import { UserMeController } from './controllers/user-me.controller';
import { UserUpdateController } from './controllers/user-update.controller';
import { UserChangePasswordUseCase } from './use-cases/user-change-password.use-case';
import { UserCreateUseCase } from './use-cases/user-create.use-case';
import { UserFindByIdUseCase } from './use-cases/user-find-by-id.use-case';
import { UserFindOneUseCase } from './use-cases/user-find-one.use-case';
import { UserForgotPasswordUseCase } from './use-cases/user-forgot-password.use-case';
import { UserGetAccessTokenInfoUseCase } from './use-cases/user-get-access-token-info.use-case';
import { UserGetUserUseCase } from './use-cases/user-get-user.use-case';
import { UserMeUseCase } from './use-cases/user-me.use-case';
import { UserSendCredentialResetUseCase } from './use-cases/user-send-credential-reset.use-case';
import { UserSetPasswordUseCase } from './use-cases/user-set-password.use-case';
import { UserUpdateUseCase } from './use-cases/user-update.use-case';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [keycloakConfig],
    }),
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
