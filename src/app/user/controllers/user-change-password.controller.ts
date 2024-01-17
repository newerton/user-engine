import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AxiosRequestHeaders } from 'axios';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import { UserChangePasswordInput } from '@app/user/dtos';
import { UserChangePasswordUseCase } from '@app/user/use-cases';

import { UserPasswordSchemaValidation } from '../validations';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserChangePasswordController {
  constructor(private readonly useCase: UserChangePasswordUseCase) {}

  @MessagePattern('users.change_password')
  async execute(
    @Payload(
      'payload',
      new ZodValidationPipe(new UserPasswordSchemaValidation()),
    )
    payload: UserChangePasswordInput,
    @Payload('headers')
    headers: AxiosRequestHeaders,
  ): Promise<void> {
    return this.useCase.execute(payload, headers);
  }
}
