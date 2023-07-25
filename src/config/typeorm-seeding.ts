import { typeormConfig } from './typeorm';

export default {
  ...typeormConfig,
  entities: ['src/db/entities/typeorm/*.entity{.ts,.js}'],
};
