import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { JoiValidationPipe } from '@app/@common/application/pipes/joi-validation.pipe';
import {
  UserForgotPasswordInput,
  UserForgotPasswordOutput,
} from '@app/user/dtos/user-forgot-password.dto';
import { UserForgotPasswordUseCase } from '@app/user/use-cases/user-forgot-password.use-case';
import { UserEmailSchemaValidation } from '@app/user/validations/user-email-schema.validation';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserForgotPasswordController {
  constructor(private readonly useCase: UserForgotPasswordUseCase) {}

  @MessagePattern('users.forgot_password')
  execute(
    @Payload('payload', new JoiValidationPipe(new UserEmailSchemaValidation()))
    payload: UserForgotPasswordInput,
  ): Promise<UserForgotPasswordOutput> {
    return this.useCase.execute(payload);
  }
}
