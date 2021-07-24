import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { KafkaCreateUserDto } from './dtos/create-user.dto';
import { KafkaIdUserDto } from './dtos/id-user.dt';
import { KafkaUpdateUserDto } from './dtos/update-user.dto';
import { JoiValidationKafkaPipe } from './pipes/joi.validation.kafka.pipe';
import { User } from './schemas/user.schema';
import { CreateUserSchema } from './validations/create.schema.validation';
import { UpdateUserSchema } from './validations/update.schema.validation';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('users.create')
  async create(
    @Payload(new JoiValidationKafkaPipe(new CreateUserSchema()))
    { value }: KafkaCreateUserDto,
  ): Promise<User> {
    return await this.appService.create(value);
  }

  @MessagePattern('users.findall')
  async findAll(): Promise<User[]> {
    return await this.appService.findAll();
  }

  @MessagePattern('users.findbyid')
  async findOne(
    @Payload() { value }: KafkaIdUserDto,
  ): Promise<User | undefined> {
    const { id } = value;
    return await this.appService.findOne(id);
  }

  @MessagePattern('users.findbyemail')
  async findOneByEmail(
    @Payload() value: { email: string },
  ): Promise<User | undefined> {
    const { email } = value;
    return await this.appService.findOneByEmail(email);
  }

  @MessagePattern('users.update')
  async update(
    @Payload(new JoiValidationKafkaPipe(new UpdateUserSchema()))
    { value }: KafkaUpdateUserDto,
  ): Promise<any> {
    const { id, user } = value;
    return await this.appService.update(id, user);
  }

  @MessagePattern('users.remove')
  remove(@Payload() { value }: KafkaIdUserDto): any {
    const { id } = value;
    return this.appService.remove(id);
  }
}
