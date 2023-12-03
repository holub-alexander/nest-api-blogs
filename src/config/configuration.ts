import { type ValidationPipeOptions, HttpStatus } from '@nestjs/common';
import invariant from 'tiny-invariant';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: 'env/.env.test' });

export type ConfigObject = ReturnType<typeof configuration>;

export function configuration() {
  invariant(process.env.SECRET, 'SECRET is missing');

  return {
    port: Number.parseInt(process.env.PORT as string, 10) || 3000,
    secret: process.env.SECRET,
    validation: {
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    } as ValidationPipeOptions,
  };
}
