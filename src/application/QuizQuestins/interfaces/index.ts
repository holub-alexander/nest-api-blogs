export interface QuizQuestionInputModel {
  body: string;
  correctAnswers: (string | number)[] | null;
}

export interface QuizQuestionViewModel {
  id: string;
  body: string | null;
  correctAnswers: (string | number)[];
  published: boolean;
  createdAt: string;
  updatedAt: string | null;
}
