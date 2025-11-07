import { CreateProjectDto } from "./dto/create.project.dto";
import { IProject, Project, ProjectStatus } from "./projects.model";
import { FullProjectDto } from "./dto/full.project.dto";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import mongoose, { HydratedDocument } from "mongoose";
import { fetchCategoryOrFail, fetchSkillsOrFail, mapProjectToFullDto, toObjectId } from "./utils/project.helpers";
import { IImage, Image } from "./images/image.model";
import { UpdateProjectDto } from "./dto/update.project.dto";
import { ISkill } from "../skills/skills.model";
import { Category, ICategory } from "../categories/category.model";

// helpers moved to ./utils/project.helpers

export type PublicProjectDetailed = {
    id: string;
    title: string;
    category: string;
    shortDescription: string;
    fullReadme: string;
    deadline: Date;
    ownerId: string;
    status: ProjectStatus;
    skills: Array<{ id: string, name: string }>;
    images: Array<{
        id: string;
        image_path: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
};

export default class ProjectsService {
    static async createProject(project: CreateProjectDto, ownerId:string, files: Express.Multer.File[] = []) {
        const categoryObjectId = await fetchCategoryOrFail(project.categoryId);
        const skillObjectIds = await fetchSkillsOrFail(project.skills);

        let newProject = await Project.create({
            title: project.title,
            categoryId: categoryObjectId.toString(),
            shortDescription: project.shortDescription,
            fullReadme: project.fullReadme ?? '',
            deadline: new Date(project.deadline),
            ownerId: ownerId.toString(),
            status: ProjectStatus.PLANNED,
            skills: skillObjectIds.map(id => id.toString()),
        });

        for (const file of (files || [])) {
            const image = await Image.create({
                image_path: file.filename,
                projectId: newProject._id,
            })
            newProject.images.push(image._id)
        }
        await newProject.save();
        
        const finishedProject = await Project.findById(newProject._id).populate<{images: IImage[]}>("images").populate<{skills: ISkill[]}>("skills").populate<{categoryId: ICategory}>("categoryId")

        if (!finishedProject) {
            throw new ErrorWithStatus(404, "Project not found");
        }

        return {
            id: finishedProject._id.toString(),
            title: finishedProject.title,
            category: {
                id: finishedProject.categoryId._id.toString(),
                name: finishedProject.categoryId.name
            },
            shortDescription: finishedProject.shortDescription,
            fullReadme: finishedProject.fullReadme,
            deadline: finishedProject.deadline,
            ownerId: finishedProject.ownerId.toString(),
            status: finishedProject.status,
            skills: finishedProject.skills?.map((skill: any) => ({id: skill._id.toString(), name: skill.name})) ?? [],
            images: finishedProject.images?.map((img: IImage) => ({
                id: img._id.toString(),
                image_path: img.image_path,
            })) ?? [],
            createdAt: finishedProject.createdAt,
            updatedAt: finishedProject.updatedAt,
        }
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
