export type UserInputModel = {
  login: string;
  password: string;
  email: string;
};

export type UserViewModel = Omit<UserInputModel, 'password'> & {
  id: string;
  createdAt: string;
};
