import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AxiosResponse } from 'axios';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { JoiValidationPipe } from '@app/@common/application/pipes/joi-validation.pipe';
import { UserCreateInput } from '@app/user/dtos/user-create.dto';
import { User } from '@app/user/schemas/user.schema';
import { UserCreateUseCase } from '@app/user/use-cases/user-create.use-case';
import { UserCreateSchemaValidation } from '@app/user/validations/user-create.schema.validation';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserCreateController {
  constructor(private readonly useCase: UserCreateUseCase) {}

  @MessagePattern('users.create')
  async execute(
    @Payload('payload', new JoiValidationPipe(new UserCreateSchemaValidation()))
    payload: UserCreateInput,
  ): Promise<AxiosResponse<User>> {
    return this.useCase.execute(payload);
  }
}
