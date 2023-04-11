import * as bcrypt from 'bcrypt';
import { generateHash } from '@/common/utils/generate-hash';

export const getPasswordHash = async (password: string): Promise<string> => {
  const passwordSalt = await bcrypt.genSalt(10);

  return generateHash(password, passwordSalt);
};
