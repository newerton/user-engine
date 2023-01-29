import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { JoiValidationPipe } from '@app/@common/application/pipes/joi-validation.pipe';
import { UserCreateInput } from '@app/user/dtos/user-create.dto';
import { User } from '@app/user/schemas/user.schema';
import { UserUpdateUseCase } from '@app/user/use-cases/user-update.use-case';
import { UserUpdateSchemaValidation } from '@app/user/validations/user-update-schema.validation';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserUpdateController {
  constructor(private readonly useCase: UserUpdateUseCase) {}

  @MessagePattern('users.update')
  async execute(
    @Payload('payload', new JoiValidationPipe(new UserUpdateSchemaValidation()))
    payload: UserCreateInput,
    @Payload('headers')
    headers: AxiosRequestHeaders,
  ): Promise<AxiosResponse<User>> {
    return this.useCase.execute(payload, headers);
  }
}
