import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import type { UserCreateInput } from '@app/user/dtos';
import type { User } from '@app/user/schemas';
import type { UserCreateUseCase } from '@app/user/use-cases';
import { UserCreateSchemaValidation } from '@app/user/validations';
import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { AxiosResponse } from 'axios';

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
