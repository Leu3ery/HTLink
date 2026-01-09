export type ProjectType = {
  id: string;
  title: string;
  category: {
    id: string;
    name: string;
  };
  shortDescription: string;
  fullReadme: string;
  deadline: string;
  ownerId: string;
  status: string;
  tags: TagType[];
  images: ImageType[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectCreateData = {
  title: string;
  shortDescription: string;
  repoUrl: string;
  categoryId: string;
  skills: string[];
  fullReadme: string;
  images: File[];
  deadline?: string;
};

export type ProfileType = {
  id: string;
  first_name: string;
  last_name: string;
  description: string;
  department: string;
  class: string;
  photo_path: string;
  role: string;
  github_link: string;
  linkedin_link: string;
  banner_link: string;
  pc_number: number;
  skills: TagType[];
  created_at: Date;
  mail: string;
};

export type ImageType = {
  id: string;
  image_path: string;
};
export type TagType = {
  id: string;
  name: string;
};

export enum NotificationType {
  Info = 1,
  Success = 2,
  Warning = 3,
  Error = 4,
}

export type OfferType = {
  id: string;
  title: string;
  description: string;
  phoneNumber: string;
  price?: number;
  photo_path?: string;
  skills: TagType[];
  ownerId: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    photo_path: string | null;
    mail: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export type CreateOfferData = {
  title: string;
  description: string;
  phoneNumber: string;
  price?: number;
  skills: string[];
  photo_path?: File;
}

export type UpdateOfferData = {
  title?: string;
  description?: string;
  phoneNumber?: string;
  price?: number;
  skills?: string[];
  photo_path?: File;
}
