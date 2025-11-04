import {Router} from "express";
import {ErrorWrapper} from "../../common/utils/utils.wrappers";
import ProjectsController from "./projects.controller";
import { upload } from "../../common/multer/multer.photo";
import JWTMiddleware from "../../common/middlewares/JWTMiddleware";

const projectsRouter = Router();


// post request should work with JWT
projectsRouter.post('/', JWTMiddleware, upload.array('image', 5), ErrorWrapper(ProjectsController.createProject));
//--
projectsRouter.get('/', ErrorWrapper(ProjectsController.list));
projectsRouter.patch('/:id/update_status', ErrorWrapper(ProjectsController.updateStatus));
projectsRouter.get("/:id", ErrorWrapper(ProjectsController.getProjectById));
// projectsRouter.get("own_projects/me", JWTMiddleware, ErrorWrapper(ProjectsController.getMyProjects));
projectsRouter.put("/:id/update_project", upload.array('image', 5), ErrorWrapper(ProjectsController.updateProject));

export default projectsRouter;