import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import type {
  UserForgotPasswordInput,
  UserForgotPasswordOutput,
} from '@app/user/dtos';
import type { UserForgotPasswordUseCase } from '@app/user/use-cases';
import { UserEmailSchemaValidation } from '@app/user/validations';
import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';

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
