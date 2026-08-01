import type { AuthCredentialsUseCase } from "@app/auth/use-cases/auth-credentials.use-case";
import { Code } from "@core/@shared/domain/error/Code";
import { Exception } from "@core/@shared/domain/exception/Exception";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import type {
	UserForgotPasswordInput,
	UserForgotPasswordOutput,
} from "../dtos/user-forgot-password.dto";
import type { UserGetUserUseCase } from "./user-get-user.use-case";
import type { UserSendCredentialResetUseCase } from "./user-send-credential-reset.use-case";

@Injectable()
export class UserForgotPasswordUseCase {
	constructor(
		private authCredentialsUseCase: AuthCredentialsUseCase,
		private userGetUserUseCase: UserGetUserUseCase,
		private userSendCredentialResetUseCase: UserSendCredentialResetUseCase,
	) {}

	async execute(
		payload: UserForgotPasswordInput,
	): Promise<UserForgotPasswordOutput> {
		const { email } = payload;
		const { access_token } = await lastValueFrom(
			this.authCredentialsUseCase.execute(),
		);

		if (access_token) {
			const user = await this.userGetUserUseCase.execute({ email });
			if (user) {
				this.userSendCredentialResetUseCase.execute(user.id, [
					"terms_and_conditions",
					"UPDATE_PASSWORD",
				]);
				return {
					message:
						"Pronto! Enviamos em seu e-mail o link para redefinir sua senha,<br />verifique sua caixa de entrada, e se não estiver lá verifique a área de spam!",
				};
			}
		}

		throw Exception.new({
			code: Code.BAD_REQUEST.code,
			overrideMessage: "No access token",
		});
	}
}
