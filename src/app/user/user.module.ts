import keycloakConfig from "@app/@common/infrastructure/config/keycloak.config";
import { AuthModule } from "@app/auth/auth.module";
import { KafkaServerConfig } from "@core/@shared/infrastructure/config/env";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";

import {
	UserChangePasswordController,
	UserCreateController,
	UserFindByIdController,
	UserFindOneController,
	UserForgotPasswordController,
	UserMeController,
	UserUpdateController,
} from "./controllers";
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
} from "./use-cases";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [keycloakConfig],
		}),
		HttpModule,
		ClientsModule.register([
			{
				name: "NOTIFICATION_SERVICE_KAFKA",
				transport: Transport.KAFKA,
				options: {
					client: {
						clientId: "notification",
						brokers: KafkaServerConfig.brokers(),
					},
				},
			},
		]),
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
