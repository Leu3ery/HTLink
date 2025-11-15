import { CreateProjectDto } from "./dto/create.project.dto";
import { IProject, Project, ProjectStatus } from "./projects.model";
import { FullProjectDto } from "./dto/full.project.dto";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import mongoose, { HydratedDocument } from "mongoose";
import { fetchCategoryOrFail, fetchSkillsOrFail, mapProjectToFullDto, toObjectId } from "./utils/project.helpers";
import { IImage, Image } from "./images/image.model";
import { UpdateProjectDto } from "./dto/patch.project.dto";
import { ListProjectsQueryDto } from "./dto/list.projects.dto";
import {ISkill, Skill} from "../skills/skills.model";
import { Category, ICategory } from "../categories/category.model";
import * as sea from "node:sea";


// helpers moved to ./utils/project.helpers


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
            id: finishedProject.id.toString(),
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

    static async listProjects(params: ListProjectsQueryDto) {
        const {
            search = '',
            category,
            status,
            skills = [],
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
            filter.status = status;
        }


        if (skills && skills.length > 0) {
            const objectIds = skills.map(toObjectId);
            filter.skills = { $all: objectIds };
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

        const allImageIds = projects.flatMap(p => p.images || []);

        const allImages = await Image.find({ _id: { $in: allImageIds } });

        const imageMap = new Map(
            allImages.map(img => [
                img._id.toString(),
                {
                    _id: img._id.toString(),
                    image_path: img.image_path,
                    projectId: img.projectId.toString(),
                }
            ])
        );

        const items = projects.map((p) => {
            if (!p) return null;
            const category = Category.findById(p.categoryId);



            const images = (p.images || [])
                .map(imgId => imageMap.get(imgId.toString()))
                .filter((img): img is { _id: string; image_path: string; projectId: string } => img !== undefined);

            return {
                id: p._id.toString(),
                title: p.title,
                categoryId: p.categoryId.toString(),
                shortDescription: p.shortDescription,
                tags: p.skills,
                deadline: p.deadline,
                status: p.status,
                images,
            };
        });

        const validItems = items.filter((item): item is NonNullable<typeof item> => item !== null);

        return {
            items: validItems,
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
    }



    static async getProjectById(projectId: string) {

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ErrorWithStatus(400, "Invalid project id");
        }

        const project = await Project.findById(projectId)
        if (!project) {
            throw new ErrorWithStatus(404, "Project not found");
        }
        const finishedProject = await Project.findById(project._id).populate<{images: IImage[]}>("images").populate<{skills: ISkill[]}>("skills").populate<{categoryId: ICategory}>("categoryId")

        if (!finishedProject) {
            throw new ErrorWithStatus(404, "Project not found");
        }

        return {
            id: finishedProject.id.toString(),
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
            skills: finishedProject.skills?.map((skill: ISkill) => ({id: skill._id.toString(), name: skill.name})) ?? [],
            images: finishedProject.images?.map((img: IImage) => ({
                id: img._id.toString(),
                image_path: img.image_path,
            })) ?? [],
            createdAt: finishedProject.createdAt,
            updatedAt: finishedProject.updatedAt,
        }

    }

    static async getProjectByOwnerId(ownerId: string) {
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            throw new ErrorWithStatus(400, "Invalid owner id");
        }

        const projects = await Project.find({ ownerId: ownerId })
            .populate<{images: IImage[]}>("images")
            .populate<{skills: ISkill[]}>("skills")
            .populate<{categoryId: ICategory}>("categoryId")
            .sort({ createdAt: -1 });

        if (!projects || projects.length === 0) {
            return [];
        }

        return projects.map((project) => ({
            id: project.id.toString(),
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
        }));
    }

    static async updateProject(projectId: string, updateProjectDto: UpdateProjectDto, userId: string) {

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ErrorWithStatus(400, "Invalid project id");
        }


        const project = await Project.findById(projectId);
        console.log(project?.categoryId)
        if (!project) {
            throw new ErrorWithStatus(404, "Project not found");
        }
        if (userId !== project.ownerId.toString()) {
            throw new ErrorWithStatus(403, "Forbidden");
        }
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $set: updateProjectDto },
            { new: true, runValidators: true, context: "query" }
        );


        const finishedProject = await Project
                                        .findById(updatedProject?._id)
                                        .populate<{images: IImage[]}>("images")
                                        .populate<{skills: ISkill[]}>("skills")
                                        .populate<{categoryId: ICategory}>("categoryId")

        if (!finishedProject) {
            throw new ErrorWithStatus(404, "Project not found");
        }

        return {
            id: finishedProject.id.toString(),
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
            skills: finishedProject.skills?.map((skill: ISkill) => ({id: skill._id.toString(), name: skill.name})) ?? [],
            images: finishedProject.images?.map((img: IImage) => ({
                id: img._id.toString(),
                image_path: img.image_path,
            })) ?? [],
            createdAt: finishedProject.createdAt,
            updatedAt: finishedProject.updatedAt,
        }
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
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
