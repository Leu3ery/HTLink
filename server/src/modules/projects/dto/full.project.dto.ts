export type FullProjectDto = {
  _id: string;
  title: string;
  category: string;
  shortDescription: string;
  fullReadme: string;
  deadline: Date | null;
  ownerId: string;
  status: string;
  skills: string[];
  images: Array<{
    _id: string;
    image_path: string;
    projectId: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
