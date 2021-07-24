import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { User } from './schemas/user.schema';

type ValidationType = {
  message: string;
  details: any;
};

export class AppException extends RpcException {}

/**
 * Doc: https://cloud.google.com/apis/design/errors#handling_errors
 */
export class EmailConflictException extends AppException {
  constructor() {
    super({
      statusCode: HttpStatus.CONFLICT,
      error: 'Conflict',
      message: 'E-mail já cadastrado',
    });
  }
}

export class EmailValidationTokenException extends AppException {
  constructor(user: User) {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'Unauthorized',
      message: `Olá ${user.first_name}, para efetivar o seu cadastro, verifique o seu e-mail ${user.email}.`,
    });
  }
}

export class InvalidEmailConfirmationTokenException extends AppException {
  constructor(message: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message,
    });
  }
}

export class InvalidPasswordResetTokenException extends AppException {
  constructor(message: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message,
    });
  }
}

export class UserNotFoundException extends AppException {
  constructor() {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'Not Found',
      message:
        'Não foi possível atualizar os dados. Tente novamente mais tarde.',
    });
  }
}

export class JoiValidationException extends AppException {
  constructor(err: ValidationType) {
    super({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: 'Unprocessable Entity',
      ...err,
    });
  }
}
