import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import { UserSearchInput } from '@app/user/dtos';
import { User } from '@app/user/schemas';
import { UserFindOneUseCase } from '@app/user/use-cases';
import { UserrSearchSchemaValidation } from '@app/user/validations';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserFindOneController {
  constructor(private readonly useCase: UserFindOneUseCase) {}

  @MessagePattern('users.find_one')
  findOne(
    @Payload(new ZodValidationPipe(new UserrSearchSchemaValidation()))
    payload: UserSearchInput,
  ): Promise<User> {
    return this.useCase.execute(payload);
  }
}
