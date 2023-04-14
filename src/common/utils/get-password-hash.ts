import bcrypt from 'bcrypt';
import { generateHash } from './generate-hash';

export const getPasswordHash = async (password: string): Promise<string> => {
  const passwordSalt = await bcrypt.genSalt(10);

  return generateHash(password, passwordSalt);
};
