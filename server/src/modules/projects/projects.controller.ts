import { NextFunction } from "express";
import ProjectsService from "./projects.service";
import type { Request, Response } from "express";
import { createProjectSchema } from "./dto/create.project.dto";
import {validationWrapper} from "../../common/utils/utils.wrappers";
import {statusSchema} from "./dto/status.dto";
import {ErrorWithStatus} from "../../common/middlewares/errorHandlerMiddleware";
import { updateProjectSchema } from "./dto/patch.project.dto";
import { listProjectsQuerySchema, ListProjectsQueryDto } from "./dto/list.projects.dto";

export default class ProjectsController{


    static async createProject(req: Request, res: Response, next: NextFunction) {

        const body = { ...req.body };
        if (body.skills !== undefined) {
            body.skills = Array.isArray(body.skills) ? body.skills : [body.skills];
        }
        
        const dto = validationWrapper(createProjectSchema, body);
        const userId = res.locals?.user?.userId;
        if (!userId) throw new ErrorWithStatus(401, "Authentication required");
        const files = (req.files as Express.Multer.File[]) || [];
        const project = await  ProjectsService.createProject(dto,userId, files);
        res.status(201).json({ project });
        
    }

    static async list(req: Request, res: Response, next: NextFunction) {
        const dto = validationWrapper(listProjectsQuerySchema, req.query);

        const response = await ProjectsService.listProjects(dto);

        res.status(200).json(response);
    }

    static async getProjectById(req: Request, res: Response, next: NextFunction) {
        const projectId = req.params.id;
        if (!projectId) throw new ErrorWithStatus(400, "Project ID is required");
        const project = await ProjectsService.getProjectById(projectId);
        res.status(200).json({ project });
                
    }



    static async getOwnerProjects(req: Request, res: Response, next: NextFunction) {

        const paramId = req.params.id;
        if (!paramId) throw new ErrorWithStatus(400, "Owner ID is required");

        let ownerId = paramId;

        if (paramId === "me") {
            const userId = res.locals?.user?.userId;

            if (!userId) throw new ErrorWithStatus(401, "Authentication required");
            ownerId = userId;
        }

        const dto = validationWrapper(listProjectsQuerySchema, req.query);
        const projects = await ProjectsService.listProjects({ ownerId, ...dto });
        res.status(200).json({ projects });
    }

    static async updateProject(req: Request, res: Response, next: NextFunction) {

        const body = { ...req.body };
        if (body.skills !== undefined) {
            body.skills = Array.isArray(body.skills) ? body.skills : [body.skills];
        }

        const dto = validationWrapper(updateProjectSchema, body);
        const userId =  res.locals?.user?.userId;

        const projectId = req.params.id;
        if (!projectId) throw new ErrorWithStatus(400, "Project ID is required");

        const project = await  ProjectsService.updateProject(projectId, dto, userId);
        res.status(200).json({ project });

    }

    static async deleteProject(req: Request, res: Response, next: NextFunction) {
        const user = res.locals?.user;
        const projectId = req.params.id;
        if (!projectId) throw new ErrorWithStatus(400, "Project ID is required");
        await ProjectsService.deleteProject(projectId, user?.userId);
        res.status(200).json({ message: "Project deleted successfully" });
    }



}