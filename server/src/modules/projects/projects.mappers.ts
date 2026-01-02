import { IImage } from "./images/image.model";
import { ISkill } from "../skills/skills.model";
import { ICategory } from "../categories/category.model";

type PopulatedProject = {
    _id: any;
    id?: any;
    title: string;
    categoryId: ICategory;
    shortDescription: string;
    fullReadme: string;
    deadline?: Date;
    ownerId: any;
    status: string;
    skills?: ISkill[];
    images?: IImage[];
    createdAt: Date;
    updatedAt: Date;
};

export type FullProjectResponseDto = {
    id: string;
    title: string;
    category: {
        id: string;
        name: string;
    };
    shortDescription: string;
    fullReadme: string;
    deadline: Date | undefined;
    ownerId: string;
    status: string;
    skills: Array<{
        id: string;
        name: string;
    }>;
    images: Array<{
        id: string;
        image_path: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
};

export function mapToFullProjectResponseDto(project: PopulatedProject): FullProjectResponseDto {
    return {
        id: (project.id ?? project._id).toString(),
        title: project.title,
        category: {
            id: project.categoryId._id.toString(),
            name: project.categoryId.name
        },
        shortDescription: project.shortDescription,
        fullReadme: project.fullReadme,
        deadline: project.deadline,
        ownerId: project.ownerId.toString(),
        status: project.status,
        skills: project.skills?.map((skill: ISkill) => ({
            id: skill._id.toString(),
            name: skill.name
        })) ?? [],
        images: project.images?.map((img: IImage) => ({
            id: img._id.toString(),
            image_path: img.image_path,
        })) ?? [],
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    };
}

