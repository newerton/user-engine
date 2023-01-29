import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { JoiValidationPipe } from '@app/@common/application/pipes/joi-validation.pipe';
import { UserSearchInput } from '@app/user/dtos/user-search.dto';
import { User } from '@app/user/schemas/user.schema';
import { UserFindOneUseCase } from '@app/user/use-cases/user-find-one.use-case';
import { UserrSearchSchemaValidation } from '@app/user/validations/user-search-schema.validation';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserFindOneController {
  constructor(private readonly useCase: UserFindOneUseCase) {}

  @MessagePattern('users.find_one')
  findOne(
    @Payload(new JoiValidationPipe(new UserrSearchSchemaValidation()))
    payload: UserSearchInput,
  ): Promise<User> {
    return this.useCase.execute(payload);
  }
}
