import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  password?: string;
}

export class KafkaUpdateUserDto {
  value: {
    id: string;
    user: UpdateUserDto;
  };
}
