import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailConflictException,
  EmailValidationTokenException,
  UserNotFoundException,
} from './app.exceptions';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create({
    first_name,
    last_name,
    email,
    password_current,
    device_token,
  }: CreateUserDto): Promise<any> {
    const clientExist = await this.userModel.findOne({ email });

    if (clientExist) {
      throw new EmailConflictException();
    }

    const data = {
      first_name,
      last_name,
      email,
      password: password_current,
      device_token,
      visible: false,
    };
    const user = new this.userModel(data);
    await user.save();

    throw new EmailValidationTokenException(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => new User(user.toJSON()));
  }

  async findOne(_id: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ _id }).exec();
    if (user) {
      return new User(user.toJSON());
    }

    throw new UserNotFoundException();
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      return new User(user.toJSON());
    }

    throw new UserNotFoundException();
  }

  async update(_id: string, data: UpdateUserDto): Promise<User | undefined> {
    delete data.email;
    delete data.password;

    const updated = await this.userModel.findOneAndUpdate(
      { _id },
      { $set: data },
    );
    if (updated) {
      const user = await this.userModel.findOne({ _id }).exec();
      if (user) {
        return new User(user.toJSON());
      }
    }
    throw new UserNotFoundException();
  }

  async remove(_id: string) {
    const user = await this.findOne(_id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return await this.userModel.deleteOne({ _id });
  }
}
