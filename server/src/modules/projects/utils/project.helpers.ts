import mongoose from "mongoose";
import { Category } from "../../categories/category.model";
import { Skill } from "../../skills/skills.model";
import { ErrorWithStatus } from "../../../common/middlewares/errorHandlerMiddleware";
import { FullProjectDto } from "../dto/full.project.dto";
import { ProjectDocument } from "../projects.model";

export const toObjectId = (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ErrorWithStatus(400, `Invalid id: ${id}`);
    }
    return new mongoose.Types.ObjectId(id);
};

export async function fetchCategoryOrFail(categoryId: string) {
    const objectId = toObjectId(categoryId);
    const category = await Category.findById(objectId).catch(() => null);
    if (!category) throw new ErrorWithStatus(404, "Category not found");
    return objectId;
}

export async function fetchSkillsOrFail(skillIds: string[]) {
    const objectIds = skillIds.map(toObjectId);
    const skills = await Skill.find({ _id: { $in: objectIds } }).catch(() => []);
    if (skills.length !== objectIds.length) {
        throw new ErrorWithStatus(404, "One or more skills not found");
    }
    return skills.map(s => s._id);
}

export function mapProjectToFullDto(newProject: ProjectDocument, images: Array<{ _id: mongoose.Types.ObjectId; image_path: string; projectId: mongoose.Types.ObjectId;}> = []): FullProjectDto {
    return {
        _id: newProject._id.toString(),
        title: newProject.title,
        category: newProject.categoryId.toString(),
        shortDescription: newProject.shortDescription,
        fullReadme: newProject.fullReadme || '',
        deadline: newProject.deadline ?? null,
        ownerId: newProject.ownerId.toString(),
        status: newProject.status,
        skills: (newProject.skills as unknown as mongoose.Types.ObjectId[]).map(id => id.toString()),
        images: images.map(img => ({
            _id: img._id.toString(),
            image_path: img.image_path,
            projectId: img.projectId.toString()
        })),
        createdAt: newProject.createdAt.toISOString().slice(0, 10),
        updatedAt: newProject.updatedAt.toISOString().slice(0, 10),
    };
}


