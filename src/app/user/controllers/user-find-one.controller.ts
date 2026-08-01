import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter';
import { ZodValidationPipe } from '@app/@common/application/pipes';
import type { UserSearchInput } from '@app/user/dtos';
import type { User } from '@app/user/schemas';
import type { UserFindOneUseCase } from '@app/user/use-cases';
import { UserrSearchSchemaValidation } from '@app/user/validations';
import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';

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
