import { CreateUserDto } from 'src/dtos/create-user.dto';
import { Headers } from './headers.types';

export type UserCreatePayload = {
  user: CreateUserDto;
  headers: Headers;
};
