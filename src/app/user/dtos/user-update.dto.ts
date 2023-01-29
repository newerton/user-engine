import { PartialType } from '@nestjs/mapped-types';

import { UserCreateInput } from './user-create.dto';

export class UserUpdateInput extends PartialType(UserCreateInput) {
  password?: string;
}

export class KafkaUpdateUserDto {
  value: {
    id: string;
    user: UserUpdateInput;
  };
}
