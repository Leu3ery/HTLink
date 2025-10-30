import { CreateProjectDto } from "./dto/create.project.dto";
import { Project, ProjectStatus } from "./projects.model";
import { FullProjectDto } from "./dto/full.project.dto";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import mongoose from "mongoose";
import { fetchCategoryOrFail, fetchSkillsOrFail, mapProjectToFullDto, parseIdArray } from "./utils/project.helpers";
import { Image } from "./images/image.model";
import type { Express } from "express";
import path from "path";

// helpers moved to ./utils/project.helpers

export default class ProjectsService { 

    static async createProject(project: CreateProjectDto, files: Express.Multer.File[] = []): Promise<FullProjectDto> {

        const projectId = new mongoose.Types.ObjectId();
        // TODO should be replaced with the user id from the request
        const ownerId = new mongoose.Types.ObjectId();

        const categoryObjectId = await fetchCategoryOrFail(project.categoryId);

        const skillIdsInput = parseIdArray(project.skills as unknown as string[] | string);
        const skillObjectIds = await fetchSkillsOrFail(skillIdsInput);

        let newProject;
        try {
            newProject = await Project.create({
                _id: projectId,
                title: project.title,
                categoryId: categoryObjectId.toString(),
                shortDescription: project.shortDescription,
                fullReadme: project.fullReadme ?? '',
                deadline: new Date(project.deadline).toISOString(),
                ownerId: ownerId.toString(),
                status: ProjectStatus.PLANNED,
                skills: skillObjectIds.map(id => id.toString()),
            });
        } catch (err: unknown) {
            const maybeMongoErr = err as { code?: number; keyValue?: Record<string, unknown> };
            if (maybeMongoErr && maybeMongoErr.code === 11000) {
                const duplicateField = Object.keys(maybeMongoErr.keyValue || {})[0] || 'field';
                const duplicateValue = maybeMongoErr.keyValue?.[duplicateField];
                throw new ErrorWithStatus(409, `Project with ${duplicateField} "${duplicateValue}" already exists`);
            }
            throw err as Error;
        }

        const images = await Promise.all(
            (files || []).map(file => Image.create({
                image_path: path.join('projects', newProject._id.toString(), file.filename),
                projectId: newProject._id,
            }))
        );

        return mapProjectToFullDto(newProject, images);
    }
}