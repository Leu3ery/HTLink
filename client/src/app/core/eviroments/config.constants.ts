export const API_URL = 'https://api.example.com/';




export type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  likes: number;
}
