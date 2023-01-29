import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, verify } from 'jsonwebtoken';

import { Code } from '@core/@shared/domain/error/Code';
import { Exception } from '@core/@shared/domain/exception/Exception';

@Injectable()
export class UserGetAccessTokenInfoUseCase {
  constructor(private configService: ConfigService) {}

  certPublicKey = this.configService.get<string>(
    'keycloak.certPublicKey',
  ) as string;

  async execute(headers: any): Promise<string | JwtPayload> {
    const accessTokenHeader = headers.authorization;
    if (!accessTokenHeader) {
      throw Exception.new({
        code: Code.BAD_REQUEST,
        overrideMessage: 'Not access token',
      });
    }

    const [, token] = accessTokenHeader.split(' ');

    try {
      return verify(token, this.certPublicKey);
    } catch (err) {
      throw Exception.new({
        code: Code.BAD_REQUEST,
        overrideMessage: 'Access token invalid',
      });
    }
  }
}
