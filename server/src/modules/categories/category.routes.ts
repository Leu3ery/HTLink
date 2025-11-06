import { Router } from "express";
import { ErrorWrapper } from "../../common/utils/utils.wrappers";
import CategoryController from "./category.controller";

const router = Router()

router.get('/', ErrorWrapper(CategoryController.getCategories))

export default router