import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { classToPlain, Exclude, Expose, Transform } from 'class-transformer';

import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

export class BaseDBObject {
  @Expose({ name: 'id' })
  @Transform((obj) => obj?.value?.toString())
  _id: string;

  @Exclude()
  __v: any;

  toJSON() {
    return classToPlain(this);
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}

@Schema()
export class User extends BaseDBObject {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @Exclude()
  @Prop({ default: null })
  password_reset_token?: string;

  @Exclude()
  @Prop({ default: null })
  verification_token?: string;

  @Exclude()
  @Prop({ default: null })
  auth_key: string;

  @Exclude()
  @Prop({ default: null })
  device_token: string;

  @Exclude()
  @Prop({ required: true, default: new Date() })
  created_at: Date;

  @Exclude()
  @Prop({ required: true, default: new Date() })
  updated_at: Date;

  @Exclude()
  @Prop({ default: null })
  deleted_at: Date;

  @Exclude()
  @Prop({ default: false })
  visible: boolean;

  constructor(partial: Partial<User> = {}) {
    super();
    Object.assign(this, partial);
  }
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const user = this as any;
  if (user.password) {
    const hashedPassword = await bcrypt.hash(user.password, 8);
    user.password = hashedPassword;
  }
});

UserSchema.methods.comparePasswords = async function (
  submittedPassword: string,
) {
  const user = this as any;
  const isValid = await bcrypt.compare(submittedPassword, user.password);
  return isValid;
};

export { UserSchema };
