export class CreateUserDto {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_current: string;
  device_token?: string;
}

export class KafkaCreateUserDto {
  value: CreateUserDto;
}
