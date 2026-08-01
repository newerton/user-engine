import { KeycloakUseCaseException } from "@core/@shared/infrastructure/adapter/identify-and-access/keycloak/exception/keycloak-error.exception";
import type { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { AxiosRequestHeaders, AxiosResponse } from "axios";
import { lastValueFrom } from "rxjs";

import type { User } from "../schemas/user.schema";

@Injectable()
export class UserMeUseCase {
	constructor(
		private httpService: HttpService,
		private configService: ConfigService,
	) {}

	baseInternalUrl = this.configService.get<string>("keycloak.baseInternalUrl");
	realm = this.configService.get<string>("keycloak.realm");
	url = `${this.baseInternalUrl}/admin/realms/${this.realm}/users`;
	urlUserInfo = `${this.baseInternalUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
	options = {
		headers: {},
	};

	async execute(headers: AxiosRequestHeaders): Promise<AxiosResponse<User>> {
		this.options.headers.authorization = headers.authorization;

		return await lastValueFrom(
			this.httpService.get(this.urlUserInfo, this.options),
		)
			.then(async (res) => res.data)
			.catch((e) => new KeycloakUseCaseException(e));
	}
}
