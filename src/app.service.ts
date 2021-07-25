import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, lastValueFrom } from 'rxjs';
import { CreateUserDto } from './dtos/create-user.dto';
import { AxiosResponse } from 'axios';
import { Headers } from './types/headers.types';
import {
  AppException,
  BadRequestException,
  ConflictException,
  NewUserException,
  UnauthorizedException,
} from './app.exceptions';
import { ClientProxy } from '@nestjs/microservices';
import { Auth } from './types/auth.types';
import { User } from './schemas/user.schema';
import { decode, JwtPayload, verify } from 'jsonwebtoken';
import { ForgoPasswordDto } from './dtos/forgot-password.dto';
import { MessageResponse } from './types/messageResponse.types';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  baseUrl = this.configService.get<string>('keycloak.baseUrl');
  realm = this.configService.get<string>('keycloak.realm');
  certPublicKey = this.configService.get<string>(
    'keycloak.certPublicKey',
  ) as string;
  url = `${this.baseUrl}/admin/realms/${this.realm}/users`;
  urlUserInfo = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
  options = {
    headers: {} as Headers,
  };

  credentials(): Observable<Auth> {
    return this.client.send('auth.credentials', {});
  }

  async create(userDto: CreateUserDto): Promise<AxiosResponse<User>> {
    const { firstName, lastName, email, passwordCurrent, deviceToken } =
      userDto;

    const payload = {
      username: email,
      firstName,
      lastName,
      email,
      groups: ['/User'],
      emailVerified: false,
      enabled: true,
      attributes: {
        locale: ['pt-BR'],
        device_token: '',
      },
      requiredActions: ['terms_and_conditions', 'VERIFY_EMAIL'],
    };

    if (deviceToken) {
      payload.attributes.device_token = deviceToken;
    }

    const { access_token } = await lastValueFrom(this.credentials());

    if (access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      return await lastValueFrom(
        this.httpService.post(this.url, payload, this.options),
      )
        .then(async (res) => {
          const users = await this.getUser(email);
          if (users && users.length > 0) {
            const user = users[0];
            await this.setPassword(user.id, passwordCurrent);
            this.sendCredentialReset(user.id, [
              'terms_and_conditions',
              'VERIFY_EMAIL',
            ]);
            throw new NewUserException(
              `Olá ${user.firstName}, para efetivar o seu cadastro verifique o seu e-mail ${user.email}.`,
            );
          }
          return res.data;
        })
        .catch((e) => {
          this.error(e);
        });
    }

    throw new BadRequestException({ error: 'No access token' });
  }

  async update(
    userDto: CreateUserDto,
    headers: Headers,
  ): Promise<AxiosResponse<User>> {
    const { firstName, lastName, email } = userDto;

    const { sub } = await this.getAccessTokenInfo(headers);

    const payload = {} as CreateUserDto;

    if (firstName) {
      payload.firstName = firstName;
    }

    if (lastName) {
      payload.lastName = lastName;
    }

    if (email) {
      payload.email = email;
    }

    const { access_token } = await lastValueFrom(this.credentials());

    if (sub && access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      const url = `${this.url}/${sub}`;
      return await lastValueFrom(
        this.httpService.put(url, payload, this.options),
      )
        .then(async (res) => res.data)
        .catch((e) => {
          this.error(e);
        });
    }

    throw new BadRequestException({ error: 'Access token invalid' });
  }

  async changePassword(
    passwords: ChangePasswordDto,
    headers: Headers,
  ): Promise<void> {
    const { passwordCurrent } = passwords;

    const { sub } = await this.getAccessTokenInfo(headers);

    const { access_token } = await lastValueFrom(this.credentials());

    if (sub && access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      return await this.setPassword(sub.toString(), passwordCurrent);
    }

    throw new BadRequestException({ error: 'Access token invalid' });
  }

  async me(headers: Headers): Promise<AxiosResponse<User>> {
    this.options.headers.authorization = headers.authorization;
    return await lastValueFrom(
      this.httpService.get(this.urlUserInfo, this.options),
    )
      .then(async (res) => res.data)
      .catch((e) => this.error(e));
  }

  async forgotPassword(payload: ForgoPasswordDto): Promise<MessageResponse> {
    const { email } = payload;
    const { access_token } = await lastValueFrom(this.credentials());

    if (access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      const users = await this.getUser(email);
      if (users && users.length > 0) {
        const user = users[0];
        this.sendCredentialReset(user.id, [
          'terms_and_conditions',
          'UPDATE_PASSWORD',
        ]);
        return {
          message:
            'Pronto! Enviamos em seu e-mail o link para redefinir sua senha,<br />verifique sua caixa de entrada, e se não estiver lá verifique a área de spam!',
        };
      }
    }

    throw new BadRequestException({ error: 'No access token' });
  }

  async getUser(email: string): Promise<User[]> {
    const url = `${this.url}?email=${email}`;
    return await lastValueFrom(this.httpService.get(url, this.options))
      .then(async (res) => res.data)
      .catch((e) => this.error(e));
  }

  async setPassword(userId: string, password: string): Promise<void> {
    const payload = { type: 'password', value: password, temporary: false };
    const url = `${this.url}/${userId}/reset-password`;
    return await lastValueFrom(this.httpService.put(url, payload, this.options))
      .then(async (res) => res.data)
      .catch((e) => this.error(e));
  }

  async sendCredentialReset(
    userId: string,
    actions: Array<string>,
  ): Promise<AxiosResponse<any>> {
    const url = `${this.url}/${userId}/execute-actions-email?lifespan=43200`;
    return await lastValueFrom(this.httpService.put(url, actions, this.options))
      .then(async (res) => res.data)
      .catch((e) => this.error(e));
  }

  error(e: any): any {
    if (e.response) {
      const errorResponse = e.response;
      if (errorResponse.status === 409) {
        throw new ConflictException(errorResponse.data.errorMessage);
      }
    }
    if (e.getError()) {
      throw new AppException(e.getError());
    }

    throw new UnauthorizedException(e);
  }

  async getAccessTokenInfo(headers: Headers): Promise<string | JwtPayload> {
    const accessTokenHeader = headers.authorization;
    if (!accessTokenHeader) {
      throw new BadRequestException({ error: 'No access token' });
    }

    const [, token] = accessTokenHeader.split(' ');

    try {
      return verify(token, this.certPublicKey);
    } catch (err) {
      throw new BadRequestException({ error: 'Access token invalid' });
    }
  }

  hasJsonStructure(str: any) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
      return false;
    }
  }
}
