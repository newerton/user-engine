import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import { UserCreateInput } from '@app/user/dtos';
import { User } from '@app/user/schemas';
import { UserUpdateUseCase } from '@app/user/use-cases';
import { UserUpdateSchemaValidation } from '@app/user/validations';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserUpdateController {
  constructor(private readonly useCase: UserUpdateUseCase) {}

  @MessagePattern('users.update')
  async execute(
    @Payload('payload', new ZodValidationPipe(new UserUpdateSchemaValidation()))
    payload: UserCreateInput,
    @Payload('headers')
    headers: AxiosRequestHeaders,
  ): Promise<AxiosResponse<User>> {
    return this.useCase.execute(payload, headers);
  }
}
