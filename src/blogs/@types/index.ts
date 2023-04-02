export type BlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogViewModel = BlogInputModel & {
  id: string;
  createdAt: string | Date;
  isMembership: boolean;
};

export type BlogPostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
};
