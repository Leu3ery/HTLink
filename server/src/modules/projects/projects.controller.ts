import { NextFunction } from "express";
import ProjectsService from "./projects.service";
import type { Request, Response } from "express";
import { createProjectSchema } from "./dto/create.project.dto";
import {validationWrapper} from "../../common/utils/utils.wrappers";
import {statusSchema} from "./dto/status.dto";
import {ErrorWithStatus} from "../../common/middlewares/errorHandlerMiddleware";
import { updateProjectSchema } from "./dto/update.project.dto";

export default class ProjectsController{

    static async createProject(req: Request, res: Response, next: NextFunction) {
        const dto = validationWrapper(createProjectSchema, req.body || {});
        const userId = res.locals?.user?.userId;
        if (!userId) throw new ErrorWithStatus(400, "User ID is required");
        const files = (req.files as Express.Multer.File[]) || [];
        const project = await  ProjectsService.createProject(dto,userId, files);
        res.status(201).json(project);
        
    }

    static async list(req: Request, res: Response, next: NextFunction) {
        const {
            search = '',
            category,
            status,
            skills,
            page = '1',
            limit = '10',
        } = req.query as Record<string, string | undefined>;

        const params: {
            search?: string;
            category?: string;
            status?: string;
            skills?: string[];
            page: number;
            limit: number;
        } = {
            page: Number(page || 1),
            limit: Number(limit || 10),
        };
        if (isNaN(params.page) || params.page < 1) {
            throw new ErrorWithStatus(400, "Invalid page number");
        }
        if (isNaN(params.limit) || params.limit < 1 || params.limit > 100) {
            throw new ErrorWithStatus(400, "Invalid limit number");
        }

        const s = String(search || '').trim();
        if (s) params.search = s;
        if (category) params.category = String(category);
        if (status) params.status = String(status);
        if (typeof skills !== 'undefined') params.skills = Array.isArray(skills) ? skills : [skills];

        const response = await ProjectsService.listProjects(params);

        res.status(200).json(response);
    }

    static async getProjectById(req: Request, res: Response, next: NextFunction) {
        const projectId = req.params.id;
        if (!projectId) throw new ErrorWithStatus(400, "Project ID is required");
        const project = await ProjectsService.getProjectById(projectId);
        res.status(200).json({ project });
                
    }

    // static async getMyProjects(req: Request, res: Response, next: NextFunction) {
    //             
    //         const ownerId = res.locals.user.userId;
    //         if (!ownerId) throw new ErrorWithStatus(400, "Owner ID is required");
    //         const project = await ProjectsService.getProjectByOwnerId(ownerId);
    //         res.status(200).json({ project });
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // }

    static async updateProject(req: Request, res: Response, next: NextFunction) {
        const raw = typeof req.body?.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        const dto = validationWrapper(updateProjectSchema, raw);
        const projectId = req.params.id;
        if (!projectId) throw new ErrorWithStatus(400, "Project ID is required");
        const updatedProject = await ProjectsService.updateProject(projectId, dto);
        res.status(200).json({ project: updatedProject });
                
    }


    static async updateStatus(req: Request, res: Response, next: NextFunction) {
        const dto = validationWrapper(statusSchema, req.body);
        const projectId = req.params.id;
        if (!projectId) throw new ErrorWithStatus(400, "Project ID is required");
        const updatedProject = await ProjectsService.updateStatus(projectId, dto.status);
        res.status(200).json({ project: updatedProject });
                
    }
}