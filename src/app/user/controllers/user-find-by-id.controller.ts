import { Controller } from '@nestjs/common';
import { UseFilters } from '@nestjs/common/decorators';
import { MessagePattern } from '@nestjs/microservices';

import { RemoteProcedureCallExceptionFilter } from '@app/@common/application/exceptions/filter/rpc-exception.filter';
import { User } from '@app/user/schemas/user.schema';
import { UserFindByIdUseCase } from '@app/user/use-cases/user-find-by-id.use-case';

@Controller()
@UseFilters(new RemoteProcedureCallExceptionFilter())
export class UserFindByIdController {
  constructor(private readonly useCase: UserFindByIdUseCase) {}

  @MessagePattern('users.find_by_id')
  async execute(payload: { id: string }): Promise<User> {
    return this.useCase.execute(payload);
  }
}
