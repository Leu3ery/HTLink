import { Request, Response } from "express";
import CategoryService from "./category.service";

export default class CategoryController {
    static async getCategories(req: Request, res: Response) {
        const categories = await CategoryService.getCategories();
        res.json(categories);
    }
}