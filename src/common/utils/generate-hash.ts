import bcrypt from 'bcrypt';

export const generateHash = async (password: string, salt: string): Promise<string> => {
  return await bcrypt.hash(password, salt);
};
