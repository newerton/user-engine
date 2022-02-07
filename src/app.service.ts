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
import { JwtPayload, verify } from 'jsonwebtoken';
import { ForgoPasswordDto } from './dtos/forgot-password.dto';
import { MessageResponse } from './types/messageResponse.types';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { SearchUserDto } from './dtos/search-user.dto';

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
    const {
      firstName,
      lastName,
      email,
      passwordCurrent,
      deviceToken,
      emailVerified = false,
    } = userDto;

    const payload = {
      username: email,
      firstName,
      lastName,
      email,
      groups: ['/User'],
      emailVerified,
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
          const user = await this.getUser({ email });
          if (user) {
            await this.setPassword(user.id, passwordCurrent);
            this.sendCredentialReset(user.id, [
              'terms_and_conditions',
              'VERIFY_EMAIL',
            ]);
            if (!emailVerified) {
              throw new NewUserException(
                `Olá ${user.firstName}, para efetivar o seu cadastro verifique o seu e-mail ${user.email}.`,
              );
            }
            return user;
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
    const { firstName, lastName, email, attributes } = userDto;

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

    if (attributes) {
      payload.attributes = attributes;
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
      const user = await this.getUser({ email });
      if (user) {
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

  async findById({ id }: { id: string }): Promise<User> {
    const { access_token } = await lastValueFrom(this.credentials());
    if (access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      const url = `${this.url}/${id}`;
      return await lastValueFrom(this.httpService.get(url, this.options))
        .then(async (res) => res.data)
        .catch((e) => {
          this.error(e);
        });
    }
    throw new BadRequestException({ error: 'No access token' });
  }

  async findOne({ firstName, lastName, email }: SearchUserDto): Promise<User> {
    const { access_token } = await lastValueFrom(this.credentials());
    if (access_token) {
      this.options.headers.authorization = `Bearer ${access_token}`;
      const user = await this.getUser({ firstName, lastName, email });
      if (user) {
        return user;
      }

      throw new BadRequestException({ error: 'User not found' });
    }
    throw new BadRequestException({ error: 'No access token' });
  }

  async getUser({
    firstName,
    lastName,
    email,
  }: SearchUserDto): Promise<User | false> {
    const url = `${this.url}`;
    let query = '';
    if (firstName) {
      query += `&firstName=${firstName}`;
    }
    if (lastName) {
      query += `&lastName=${lastName}`;
    }
    if (email) {
      query += `&email=${email}`;
    }

    if (query.length > 0) {
      query = query.substring(1);
    }

    const users = await lastValueFrom(
      this.httpService.get(`${url}?${query}`, this.options),
    )
      .then(async (res) => res.data)
      .catch((e) => this.error(e));

    if (users && users.length > 0) {
      const user = users[0];
      return user;
    }

    return false;
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
    console.log(e);
    if (e.response) {
      const errorResponse = e.response;
      if (errorResponse.status === 409) {
        throw new ConflictException(errorResponse.data.errorMessage);
      }

      if (errorResponse.data) {
        throw new BadRequestException(errorResponse.data);
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
