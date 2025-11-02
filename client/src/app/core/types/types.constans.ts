export type ProjectType = {
  id: string;
  title: string;
  description: string;
  text?: string;
  images: ImageType[],
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: TagType[];
  likes: number;
  members?: ProfileType[];
}

export type ProfileType = {
  id: string,
  first_name: string,
  last_name: string,
  description: string,
  department: string,
  class: string,
  photo_path: string,
  role: string,
  github_link: string,
  linkedin_link: string,
  banner_link: string,
  pc_number: number,
  skills: TagType[],
  created_at: Date,
}

export type ImageType = {
  url: string;
  size: number;
}
export type TagType = {
  id: string;
  name: string;
}

export enum NotificationType {
  Info = 1,
  Success = 2,
  Warning = 3,
  Error = 4
}
