import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import type { UserCreateInput } from '@app/user/dtos';
import type { User } from '@app/user/schemas';
import type { UserUpdateUseCase } from '@app/user/use-cases';
import { UserUpdateSchemaValidation } from '@app/user/validations';
import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { AxiosRequestHeaders, AxiosResponse } from 'axios';

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
