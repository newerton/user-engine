import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AxiosRequestHeaders } from 'axios';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { JoiValidationPipe } from '@app/@common/application/pipes/joi-validation.pipe';
import { UserChangePasswordInput } from '@app/user/dtos/user-change-password.dto';
import { UserChangePasswordUseCase } from '@app/user/use-cases/user-change-password.use-case';
import { UserPasswordSchemaValidation } from '@app/user/validations/user-password-schema..validation';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserChangePasswordController {
  constructor(private readonly useCase: UserChangePasswordUseCase) {}

  @MessagePattern('users.change_password')
  async execute(
    @Payload(
      'payload',
      new JoiValidationPipe(new UserPasswordSchemaValidation()),
    )
    payload: UserChangePasswordInput,
    @Payload('headers')
    headers: AxiosRequestHeaders,
  ): Promise<void> {
    return this.useCase.execute(payload, headers);
  }
}
