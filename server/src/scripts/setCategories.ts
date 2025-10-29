import { Category } from "../modules/categories/category.model";

export const ProjectCategory = [
    "Web development",
    "Mobile development",
    "Design",
    "Fullstack",
    "AI",
    "Game development",
    "Data science",
    "Tutoring",
    "Electronics",
    "Other",
];

export default class setCategories {
    static categories = Object.values(ProjectCategory)

    constructor(categories: string[] = []) {
        if (categories.length > 1) {
            setCategories.categories = categories
        }
    }

    async isAlreadySet() {
        const categoriesCount = await Category.countDocuments()
        return categoriesCount == setCategories.categories.length
    }

    async set() {
        if (await this.isAlreadySet()) {
            console.log("Categories already set")
            return
        }
        await Category.deleteMany({})
        await Category.bulkWrite(setCategories.categories.map(category => ({
            insertOne: {
                document: {
                    name: category
                }
            }
        })))
        console.log("Categories were set")
    }

}