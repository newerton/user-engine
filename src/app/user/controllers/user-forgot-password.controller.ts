import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import {
  UserForgotPasswordInput,
  UserForgotPasswordOutput,
} from '@app/user/dtos';
import { UserForgotPasswordUseCase } from '@app/user/use-cases';
import { UserEmailSchemaValidation } from '@app/user/validations';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserForgotPasswordController {
  constructor(private readonly useCase: UserForgotPasswordUseCase) {}

  @MessagePattern('users.forgot_password')
  execute(
    @Payload('payload', new ZodValidationPipe(new UserEmailSchemaValidation()))
    payload: UserForgotPasswordInput,
  ): Promise<UserForgotPasswordOutput> {
    return this.useCase.execute(payload);
  }
}
