import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AxiosResponse } from 'axios';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import { UserCreateInput } from '@app/user/dtos';
import { User } from '@app/user/schemas';
import { UserCreateUseCase } from '@app/user/use-cases';
import { UserCreateSchemaValidation } from '@app/user/validations';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserCreateController {
  constructor(private readonly useCase: UserCreateUseCase) {}

  @MessagePattern('users.create')
  async execute(
    @Payload('payload', new ZodValidationPipe(new UserCreateSchemaValidation()))
    payload: UserCreateInput,
  ): Promise<AxiosResponse<User>> {
    return this.useCase.execute(payload);
  }
}
