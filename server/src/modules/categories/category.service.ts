import { Category } from "./category.model";

class CategoryService {
    static async getCategories() {
        const categories = await Category.find();
        return categories.map(category => ({
            id: category._id.toString(),
            name: category.name
        }));
    }
}

export default CategoryService;