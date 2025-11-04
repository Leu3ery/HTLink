import { CreateProjectDto } from "./dto/create.project.dto";
import { Project, ProjectStatus } from "./projects.model";
import { FullProjectDto } from "./dto/full.project.dto";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import mongoose from "mongoose";
import { fetchCategoryOrFail, fetchSkillsOrFail, mapProjectToFullDto, parseIdArray, toObjectId } from "./utils/project.helpers";
import { Image } from "./images/image.model";
import type { Express } from "express";
import path from "path";
import fs from "fs";
import { UpdateProjectDto } from "./dto/update.project.dto";
import { publicDir } from "../../app";

// Small helper to move file with EXDEV fallback
async function moveWithFallback(src: string, dest: string) {
    try {
        await fs.promises.rename(src, dest);
    } catch (err: any) {
        if (err && err.code === 'EXDEV') {
            // Cross-device link: copy and remove source
            await fs.promises.copyFile(src, dest);
            await fs.promises.unlink(src);
        } else {
            throw err;
        }
    }
}

// helpers moved to ./utils/project.helpers

export default class ProjectsService {

    static async createProject(project: CreateProjectDto,ownerId:string, files: Express.Multer.File[] = []): Promise<FullProjectDto> {

        const projectId = new mongoose.Types.ObjectId();


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
                deadline: new Date(project.deadline),
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


        const projectDir = path.join(publicDir, 'projects', newProject._id.toString());
        await fs.promises.mkdir(projectDir, { recursive: true });

        // Move files sequentially and rollback on any failure
        const movedFiles: string[] = []; // absolute dest paths already moved
        const createdImageIds: mongoose.Types.ObjectId[] = [];
        const images: any[] = [];

        try {
            for (const file of (files || [])) {
                const src = path.join(publicDir, file.filename);
                const dest = path.join(projectDir, file.filename);

                // Move file into project dir (with EXDEV fallback)
                await moveWithFallback(src, dest);
                movedFiles.push(dest);

                // Create Image document
                const imageDoc = await Image.create({
                    image_path: path.join('projects', newProject._id.toString(), file.filename),
                    projectId: newProject._id,
                });
                createdImageIds.push(imageDoc._id);
                images.push(imageDoc);
            }
        } catch (e) {
            try {
                for (const f of (files || [])) {
                    const srcPath = path.join(publicDir, f.filename);
                    try {
                        if (fs.existsSync(srcPath)) {
                            await fs.promises.unlink(srcPath);
                        }
                    } catch {}
                }
            } catch {}


            try {
                if (createdImageIds.length > 0) {
                    await Image.deleteMany({ _id: { $in: createdImageIds } });
                }
            } catch {}


            try {
                for (const p of [...movedFiles].reverse()) {
                    try {
                        if (fs.existsSync(p)) {
                            await fs.promises.unlink(p);
                        }
                    } catch {}
                }
            } catch {}


            try {
                await fs.promises.rm(projectDir, { recursive: true, force: true });
            } catch {}


            try {
                await Project.deleteOne({ _id: newProject._id });
            } catch {}

            const msg = e instanceof Error && e.message ? e.message : 'Failed to store project files';
            throw new ErrorWithStatus(500, msg);
        }

        return mapProjectToFullDto(newProject, images);
    }

    static async listProjects(params: {
        search?: string,
        category?: string,
        status?: string,
        skills?: string[],
        page?: number,
        limit?: number,
    }) {
        const {
            search = '',
            category,
            status,
            skills,
            page = 1,
            limit = 10,
        } = params;

        const filter: Record<string, unknown> = {};

        const searchFilter = this.createSearchFilter(search);
        if (typeof searchFilter !== 'undefined') {
            filter.$or = searchFilter;
        }

        if (category) {
            filter.categoryId = toObjectId(category);
        }


        if (status) {
            const matched = (Object.values(ProjectStatus) as string[])
                .find(v => v.toLowerCase() === status.toLowerCase());
            if (!matched) {
                throw new ErrorWithStatus(400, `Invalid status: ${status}`);
            }
            filter.status = matched;
        }


        if (typeof skills !== 'undefined') {
            const input = Array.isArray(skills) ? skills : [skills];

            const objectIds = input.map(toObjectId);
            if (objectIds.length > 0) {
                filter.skills = { $all: objectIds };
            }
        }

        const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
        const safePage = Math.max(1, Number(page) || 1);
        const skip = (safePage - 1) * safeLimit;

        const [total, projects] = await Promise.all([
            Project.countDocuments(filter),
            Project.find(filter)
                .populate('skills')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
        ]);

        const items = projects.map(p => ({
            id: p._id.toString(),
            title: p.title,
            shortDescription: p.shortDescription,
            tags: p.skills,
            deadline: p.deadline,
            status: p.status,
        }));

        return {
            items,
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
    }

    static async updateStatus(projectId: string, status: ProjectStatus) {
        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ErrorWithStatus(400, "Invalid project id");
        }
        const project = await Project.findByIdAndUpdate(
          projectId,
          { $set: { status } },
          { new: true, runValidators: true, context: "query" }
        );
        if (!project) {
            throw new ErrorWithStatus(404, "Project not found");
        }

        //TODO: add images to the response
        return mapProjectToFullDto(project);
    }

    static async getProjectById(projectId: string) {

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ErrorWithStatus(400, "Invalid project id");
        }

        const project = await Project.findById(projectId)
        if (!project) {
            throw new ErrorWithStatus(404, "Project not found");
        }
        return mapProjectToFullDto(project)

    }

    // static async getProjectByOwnerId(ownerId: string) {
    //     if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    //         throw new ErrorWithStatus(400, "Invalid owner id");
    //     }
    //     const project = await Project.findOne({ ownerId: ownerId })
    //     if (!project) {
    //         throw new ErrorWithStatus(404, "Project not found");
    //     }
    //     return mapProjectToFullDto(project)
    // }

    static async updateProject(projectId: string, updateProjectDto: UpdateProjectDto) {
        console.log(
            "updateProjectDto",
            updateProjectDto
        )
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ErrorWithStatus(400, "Invalid project id");
        }
        const updatedProject = await Project.findByIdAndUpdate(projectId, { $set: updateProjectDto }, { new: true, runValidators: true, context: "query" });
        if (!updatedProject) {
            throw new ErrorWithStatus(404, "Project not found");
        }
        console.log(
            "updatedProject",
            updatedProject
        )
        return mapProjectToFullDto(updatedProject);
    }

    static async deleteProject(projectId: string, userId: string) {

           if (!mongoose.Types.ObjectId.isValid(projectId)) {
               throw new ErrorWithStatus(400, "Invalid project id");
           }
           if (!mongoose.Types.ObjectId.isValid(userId) ) throw new ErrorWithStatus(400, "Invalid user id");

           const project = await Project.findById(projectId);
           if (!project) {
               throw new ErrorWithStatus(404, "Project not found");
           }

           if (project.ownerId.toString() !== userId) {
               throw new ErrorWithStatus(403, "Forbidden");
           }

           await Project.deleteOne({ _id: project._id });
           return { success: true };

    }

    static createSearchFilter(search: string) {

        if (search && search.trim()) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");  // Example: input node.js (beta)? becomes node\.js \(beta\)\?,
            const regex = new RegExp(escaped, 'i');
            return [
                    { title: regex },
                    { shortDescription: regex },
                    { fullReadme: regex },
                ];
            }
            return undefined;
        }

}
