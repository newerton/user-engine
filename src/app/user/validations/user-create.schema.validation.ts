import { z } from 'zod';

import { CreateValidationSchema } from '@app/@common/application/validators/zod/schemas';

export class UserCreateSchemaValidation implements CreateValidationSchema {
  createSchema(): z.ZodSchema {
    return z
      .object({
        firstName: z.string({
          description: 'First name',
          required_error: 'First name is required',
          invalid_type_error: 'First name must be a string',
        }),
        lastName: z.string({
          description: 'Last name',
          required_error: 'Last name is required',
          invalid_type_error: 'Last name must be a string',
        }),
        passwordCurrent: z
          .string({
            description: 'Password',
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
          })
          .min(6)
          .max(30),
        repeatPasswordCurrent: z.string({
          description: 'Repeat password',
          required_error: 'Repeat password is required',
          invalid_type_error: 'Repeat password must be a string',
        }),
        email: z
          .string({
            description: 'E-mail',
            required_error: 'E-mail is required',
            invalid_type_error: 'E-mail must be a string',
          })
          .toLowerCase()
          .email(),
        emailVerified: z
          .boolean({
            description: 'E-mail verified',
            required_error: 'E-mail verified is required',
            invalid_type_error: 'E-mail verified must be a boolean',
          })
          .default(false),
        deviceToken: z.string({
          description: 'Device Token',
          required_error: 'Device Token is required',
          invalid_type_error: 'Device Token must be a string',
        }),
      })
      .refine((data) => data.passwordCurrent === data.repeatPasswordCurrent, {
        message: 'Passwords do not match',
        path: ['repeatPasswordCurrent'],
      });
  }
}
