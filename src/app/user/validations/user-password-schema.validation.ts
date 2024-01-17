import { z } from 'zod';

import { CreateValidationSchema } from '@app/@common/application/validators/zod/schemas';

export class UserPasswordSchemaValidation implements CreateValidationSchema {
  createSchema(): Zod.ZodSchema {
    return z
      .object({
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
      })
      .refine((data) => data.passwordCurrent === data.repeatPasswordCurrent, {
        message: 'Passwords do not match',
        path: ['repeatPasswordCurrent'],
      });
  }
}
