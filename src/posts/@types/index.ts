export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostViewModel = PostInputModel & {
  id: string;
  blogName: string;
  createdAt: string | Date;
};
