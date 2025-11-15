import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import setCategories from "../src/scripts/setCategories";
import setSkills from "../src/scripts/setSkills";
import app from "../src/app";
import request from "supertest";
import {beforeAll, afterAll, it, expect, describe, beforeEach, afterEach} from "@jest/globals";
import path from "path";
import { Project, ProjectStatus } from "../src/modules/projects/projects.model";
import { Category } from "../src/modules/categories/category.model";
import { Skill } from "../src/modules/skills/skills.model";
import { fail } from "assert";
import {User} from "../src/modules/users/users.model";
import jwt from "jsonwebtoken";
import {config} from "../src/config/config";
import isPhotoExist from "../src/common/utils/utils.isPhotoExist";
import deleteFile from "../src/common/utils/utils.deleteFile";
import {ProjectPreviewCardDto} from "../src/modules/projects/dto/project.preview.card.dto";

let projectId: string
let mongo: MongoMemoryServer;
const pc_number = "20220467"
let id: string
let token: string

export function makeCreateProjectPayload(overrides: Record<string, any> = {}) {
    const oneWeekFromNowIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();


    const uniqueSuffix = Math.random().toString(36).slice(2, 6);

    const base = {
        title: "Test Project " + uniqueSuffix,
        category: "Web development",
        shortDescription: "A short description for the test project.",
        fullReadme: "# Readme\n\nDetailed info about the test project.",
        deadline: oneWeekFromNowIso,
        skills: ["Express Js", "Angular"]
    };

    return { ...base, ...overrides };
}

async function prepareProjectPayload(base: ReturnType<typeof makeCreateProjectPayload>, overrides?: any) {
    const category = await Category.findOne({ name: base.category });
    const skills = await Skill.find({ name: { $in: base.skills } });
    const skillIds = skills.map(s => s._id.toString());

    const { category: _, skills: __, ...baseWithoutCategoryAndSkills } = base;
    const payload = {
        ...baseWithoutCategoryAndSkills,
        categoryId: category?._id.toString() || '',
        skills: skillIds,
        ...overrides,
    };



    return { payload, skillIds, categoryId: category?._id.toString() || '' };
}

async function createProjectRequest(payload: any, token:string) {
    const req = request(app)
        .post("/api/projects")
        .field("title", payload.title)
        .field("categoryId", payload.categoryId)
        .field("shortDescription", payload.shortDescription)
        .field("fullReadme", payload.fullReadme)
        .field("deadline", payload.deadline)
        .set('Authorization', `Bearer ${token}`);
    
    // Handle skills array properly for multipart form data
    if (Array.isArray(payload.skills)) {
        payload.skills.forEach((skill: string) => {
            req.field("skills", skill);
        });
    } else {
        req.field("skills", payload.skills);
    }
    
    return req
        .attach("image", path.join(__dirname, "public/test.png"))
        .attach("image", path.join(__dirname, "public/test_copy.png"));

}

async function ensureProjectExists(base: ReturnType<typeof makeCreateProjectPayload>) {
    const existingData = await Project.findOne({ title: base.title });
    if (!existingData) {
        const { payload } = await prepareProjectPayload(base);

        const res = await createProjectRequest(payload, token);
        expect(res.status).toBe(201);
        projectId = res.body.project.id;
    } else {
        projectId = existingData._id.toString();
    }
}

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri);

    await new setCategories().set();
    await new setSkills().set();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
});

beforeEach(async () => {
    const user = await User.create({
        pc_number: pc_number,
        first_name: "Test",
        last_name: "User",
    });

    id = user._id.toString()

    token = jwt.sign({ userId: user._id.toString() }, config.JWT_SECRET, {
        expiresIn: "14d",
    });
});

afterEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
});

describe("Create new project", () => {
    it("should create a new project", async () => {
        const base = makeCreateProjectPayload();
        const { payload } = await prepareProjectPayload(base);

        const res = await createProjectRequest(payload, token);
        expect(res.status).toBe(201);


        expect(res.status).toBe(201);  
        expect(res.body.project).toHaveProperty("id");
        expect(res.body.project.title).toBe(base.title);
        expect(res.body.project.category.name).toBe(base.category);
        expect(res.body.project.shortDescription).toBe(base.shortDescription);
        expect(res.body.project.fullReadme).toBe(base.fullReadme);
        expect(new Date(res.body.project.deadline).toISOString()).toBe(base.deadline);
        expect(res.body.project.skills.map((skill: any) => skill.name).sort()).toEqual(base.skills.sort());
        expect(res.body.project.ownerId).toBe(id);
        expect(res.body.project.status).toBe(ProjectStatus.PLANNED);

        // check images
        expect(res.body.project.images).toHaveLength(2);
        expect(isPhotoExist(res.body.project.images[0].image_path)).toBe(true);
        await deleteFile(res.body.project.images[0].image_path)
        expect(isPhotoExist(res.body.project.images[1].image_path)).toBe(true);
        await deleteFile(res.body.project.images[1].image_path)
      })

      
      it("should return 400 if the payload is invalid", async () => {
        const base = makeCreateProjectPayload();
        const { payload } = await prepareProjectPayload(base, { deadline: "ff" });

        const res = await createProjectRequest(payload, token);
        expect(res.status).toBe(400);
      })

    it('should return 404 because of wrong project id', async() => {
        const base = makeCreateProjectPayload();
        const { payload } = await prepareProjectPayload(base, {categoryId: "wrong id"});

        const res = await createProjectRequest(payload, token);
        expect(res.status).toBe(400);
    });
})

describe("get project by id", () => {
    it("should return project by id", async () => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);

        const res = await request(app).get(`/api/projects/${projectId}`).set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.project.id).toBe(projectId);
        expect(res.body.project.title).toBe(base.title);
        expect(res.body.project.shortDescription).toBe(base.shortDescription);
        expect(res.body.project.fullReadme).toBe(base.fullReadme);
        expect(new Date(res.body.project.deadline).toISOString()).toBe(base.deadline);
        expect(res.body.project.ownerId).toBeDefined();
        expect(res.body.project.status).toBe(ProjectStatus.PLANNED);
    })

    it('should return 400 if id is not valid', async() => {
        const res = await request(app).get('/api/projects/123').set('Authorization', `Bearer ${token}`).expect(400);
    });
})
// //
// // describe("update project", () => {
// //     it("should update project by id", async () => {
// //         const base = makeCreateProjectPayload();
// //         await ensureProjectExists(base);
// //         const { skillIds, categoryId } = await prepareProjectPayload(base);
// //         console.log(categoryId)
// //         const data = {
// //             title: "Updated Title",
// //             category: categoryId,
// //             shortDescription: "Updated Short Description",
// //             fullReadme: "Updated Full Readme",
// //             deadline: "2025-11-01",
// //             status: ProjectStatus.IN_PROGRESS,
// //             skills: skillIds,
// //         };
// //         const res2 = await request(app).put(`/api/api/projects/${projectId}/update_project`).send(data).expect(200);
// //         expect(res2.body.project.title).toBe(data.title);
// //         expect(res2.body.project.shortDescription).toBe(data.shortDescription);
// //         expect(res2.body.project.fullReadme).toBe(data.fullReadme);
// //         expect(new Date(res2.body.project.deadline).toISOString()).toBe(data.deadline);
// //         expect(res2.body.project.status).toBe(data.status);
// //         expect(res2.body.project.skills).toEqual(data.skills);
// //     })
// // })

describe("List projects", () => {
    async function createProjectWith(overrides: Record<string, any> = {}) {
        const base = makeCreateProjectPayload(overrides.title ? { title: overrides.title } : {});
        const { payload } = await prepareProjectPayload(base, overrides);
        const res = await createProjectRequest(payload, token);
        expect(res.status).toBe(201);
        return res.body.project;
    }

    it("should list projects with defaults and correct pagination", async () => {
        await Project.deleteMany({});
        const p1 = await createProjectWith({ title: "Alpha Project" });
        const p2 = await createProjectWith({ title: "Beta Project" });
        const p3 = await createProjectWith({ title: "Gamma Project" });

        const res = await request(app).get("/api/projects").set('Authorization', `Bearer ${token}`).expect(200);
        console.log(res.body)
        expect(Array.isArray(res.body.items)).toBe(true);
        for (const item of res.body.items) {
            expect(item).toHaveProperty("title");
        }
        expect(res.body.total).toBe(3);
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(10);
        expect(res.body.totalPages).toBe(1);
        const titles = res.body.items.map((i:ProjectPreviewCardDto) => i.title).sort();
        expect(titles).toEqual([p1.title, p2.title, p3.title].sort());
    });

    it("should filter by search across title", async () => {
        await Project.deleteMany({});
        await createProjectWith({ title: "Unique Searchable Title" });
        await createProjectWith({ title: "Another One" });

        const res = await request(app)
            .get("/api/projects")
            .query({ search: "searchable" })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body.total).toBe(1);
        expect(res.body.items[0].title).toBe("Unique Searchable Title");

    });

    it("should filter by category id", async () => {
        await Project.deleteMany({});
        const mobile = await Category.findOne({ name: "Mobile development" });
        const web = await Category.findOne({ name: "Web development" });
        expect(mobile && web).toBeTruthy();

        await createProjectWith({ title: "Mobile App", categoryId: mobile?._id.toString() });
        await createProjectWith({ title: "Website", categoryId: web?._id.toString() });

        const res = await request(app)
            .get("/api/projects")
            .query({ category: mobile?._id.toString() })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body.total).toBe(1);
        expect(res.body.items[0].title).toBe("Mobile App");
    });


    it("should filter by skills (requires all)", async () => {
        await Project.deleteMany({});
        const s1 = await Skill.findOne({ name: "Express Js" });
        const s2 = await Skill.findOne({ name: "Angular" });
        expect(s1 && s2).toBeTruthy();

        const bothSkills = [s1?._id.toString(), s2?._id.toString()];
        await createProjectWith({ title: "Both Skills", skills: bothSkills });
        await createProjectWith({ title: "Only One", skills: [s1?._id.toString()] });

         const res = await request(app)
            .get("/api/projects")
            .query({ skills: [s1?._id.toString(), s2?._id.toString()] })
             .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body.total).toBe(1);
        expect(res.body.items[0].title).toBe("Both Skills");
        expect(res.body.items[0].images.length).toBe(2);
    });

    it("should support pagination via page and limit", async () => {
        await Project.deleteMany({});
        await createProjectWith({ title: "Proj1" });
        await createProjectWith({ title: "Proj2" });
        await createProjectWith({ title: "Proj3" });

        const res = await request(app)
            .get("/api/projects")
            .query({ limit: 2, page: 2 })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body.page).toBe(2);
        expect(res.body.limit).toBe(2);
        expect(res.body.total).toBe(3);
        expect(res.body.totalPages).toBe(2);
        expect(res.body.items.length).toBe(1);
    });

    it("should return 400 for invalid status filter", async () => {
        const res = await request(app)
            .get("/api/projects")
            .query({ status: "not_a_status" })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
        expect(res.status).toBe(400);
    });

    it("rejects invalid query params with 400 (limit/page/category/skills)", async () => {

        await request(app).get("/api/projects").query({ page: 0 }).set('Authorization', `Bearer ${token}`).expect(400);
        await request(app).get("/api/projects").query({ limit: -5 }).set('Authorization', `Bearer ${token}`).expect(400);
        await request(app).get("/api/projects").query({ page: "abc" }).set('Authorization', `Bearer ${token}`).expect(400);
        await request(app).get("/api/projects").query({ limit: "abc" }).set('Authorization', `Bearer ${token}`).expect(400);
    

        await request(app).get("/api/projects").query({ category: "not-an-id" }).set('Authorization', `Bearer ${token}`).expect(400);
    

        await request(app).get("/api/projects").query({ skills: ["ok", "not-an-id"] }).set('Authorization', `Bearer ${token}`).expect(400);
      });


      it("search is case-insensitive and trims whitespace", async () => {
        await createProjectWith({ title: "Unique Searchable Title" });
        const res = await request(app).get("/api/projects").query({ search: "  SEARCHABLE  " }).set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.total).toBe(1);
        expect(res.body.items[0].title).toBe("Unique Searchable Title");
      });

      it("should return categoryId in project preview items", async () => {
        await Project.deleteMany({});
        const category = await Category.findOne({ name: "Web development" });
        expect(category).toBeTruthy();

        await createProjectWith({ title: "Test Project", categoryId: category?._id.toString() });

        const res = await request(app)
          .get("/api/projects")
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(res.body.items.length).toBeGreaterThan(0);
        expect(res.body.items[0]).toHaveProperty("categoryId");
        expect(res.body.items[0].categoryId).toBe(category?._id.toString());
      });

      it("should filter by valid status values (case-insensitive)", async () => {
        await Project.deleteMany({});

        const base1 = makeCreateProjectPayload({ title: "Planned Project" });
        const base2 = makeCreateProjectPayload({ title: "In Progress Project" });

        const { payload: payload1 } = await prepareProjectPayload(base1);
        const { payload: payload2 } = await prepareProjectPayload(base2);

        const res1 = await createProjectRequest(payload1, token);
        const plannedId = res1.body.project.id;

        const res2 = await createProjectRequest(payload2, token);
        const inProgressId = res2.body.project.id;

        await Project.findByIdAndUpdate(inProgressId, { status: ProjectStatus.IN_PROGRESS });

        const resPlanned = await request(app)
          .get("/api/projects")
          .query({ status: "planned" })
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(resPlanned.body.total).toBe(1);
        expect(resPlanned.body.items[0].id).toBe(plannedId);

        const resInProgress = await request(app)
          .get("/api/projects")
          .query({ status: "in progress" })
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(resInProgress.body.total).toBe(1);
        expect(resInProgress.body.items[0].id).toBe(inProgressId);
      });

      it("should enforce max limit of 100 and default values", async () => {
        await Project.deleteMany({});
        await createProjectWith({ title: "Test Project" });

        const resTooLarge = await request(app)
          .get("/api/projects")
          .query({ limit: 200 })
          .set('Authorization', `Bearer ${token}`)
          .expect(400);

        const resDefault = await request(app)
          .get("/api/projects")
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(resDefault.body.page).toBe(1);
        expect(resDefault.body.limit).toBe(10);
      });
});

describe("Update project (PATCH /:id/update)", () => {
    it("should successfully update all project fields", async () => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);

        const newCategory = await Category.findOne({ name: "Mobile development" });
        const newSkills = await Skill.find({ name: { $in: ["Python", "Angular"] } });
        const newSkillIds = newSkills.map(s => s._id.toString());
        const newDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

        const updateData = {
            title: "Updated Project Title",
            categoryId: newCategory?._id.toString(),
            shortDescription: "This is an updated short description for the project.",
            fullReadme: "# Updated Readme\n\nThis is the updated full readme content.",
            deadline: newDeadline,
            status: ProjectStatus.IN_PROGRESS,
            skills: newSkillIds,
        };

        const res = await request(app)
            .patch(`/api/projects/${projectId}/update`)
            .send(updateData)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.project).toBeDefined();
        expect(res.body.project.title).toBe(updateData.title);
        expect(res.body.project.shortDescription).toBe(updateData.shortDescription);
        expect(res.body.project.fullReadme).toBe(updateData.fullReadme);
        expect(new Date(res.body.project.deadline).toISOString()).toBe(newDeadline);
        expect(res.body.project.status).toBe(ProjectStatus.IN_PROGRESS);
        expect(res.body.project.skills.length).toBe(newSkillIds.length);
    });

    it("should return 400 if validation fails", async () => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);

        const updateData = {
            title: "AB", // Too short (min 3)
        };

        await request(app)
            .patch(`/api/projects/${projectId}/update`)
            .send(updateData)
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 404 if project does not exist", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();

        const category = await Category.findOne({ name: "Web development" });
        const skills = await Skill.find({ name: { $in: ["Express Js"] } });
        const skillIds = skills.map(s => s._id.toString());

        const updateData = {
            title: "Test Title",
            categoryId: category?._id.toString(),
            shortDescription: "Short description here",
            fullReadme: "Full readme here",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: ProjectStatus.PLANNED,
            skills: skillIds,
        };

        await request(app)
            .patch(`/api/projects/${nonExistentId}/update`)
            .send(updateData)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });
});

describe("Get my projects (GET /my_projects)", () => {
    it("should return all projects owned by the authenticated user", async () => {
        await Project.deleteMany({});

        const base1 = makeCreateProjectPayload({ title: "My Project 1" });
        const base2 = makeCreateProjectPayload({ title: "My Project 2" });
        const base3 = makeCreateProjectPayload({ title: "My Project 3" });

        const { payload: payload1 } = await prepareProjectPayload(base1);
        const { payload: payload2 } = await prepareProjectPayload(base2);
        const { payload: payload3 } = await prepareProjectPayload(base3);

        await createProjectRequest(payload1, token);
        await createProjectRequest(payload2, token);
        await createProjectRequest(payload3, token);

        const res = await request(app)
            .get("/api/projects/my_projects")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.project).toBeDefined();
        expect(Array.isArray(res.body.project)).toBe(true);
        expect(res.body.project.length).toBe(3);

        res.body.project.forEach((proj: any) => {
            expect(proj.ownerId).toBe(id);
            expect(proj).toHaveProperty('id');
            expect(proj).toHaveProperty('title');
            expect(proj).toHaveProperty('category');
            expect(proj).toHaveProperty('skills');
            expect(proj).toHaveProperty('images');
        });

        // Check titles are present
        const titles = res.body.project.map((p: any) => p.title);
        expect(titles).toContain(base1.title);
        expect(titles).toContain(base2.title);
        expect(titles).toContain(base3.title);
    });

    it("should return empty array when user has no projects", async () => {
        await Project.deleteMany({});

        const res = await request(app)
            .get("/api/projects/my_projects")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.project).toBeDefined();
        expect(Array.isArray(res.body.project)).toBe(true);
        expect(res.body.project.length).toBe(0);
    });

    it("should return 401 if user is not authenticated", async () => {
        await request(app)
            .get("/api/projects/my_projects")
            .expect(401);
    });
});

describe("Delete project (DELETE /:id)", () => {
    it("should successfully delete a project owned by the user", async () => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);

        // Verify project exists
        const existsBefore = await Project.findById(projectId);
        expect(existsBefore).toBeTruthy();

        const res = await request(app)
            .delete(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.message).toBe("Project deleted successfully");

        const existsAfter = await Project.findById(projectId);
        expect(existsAfter).toBeNull();
    });

    it("should return 403 if user tries to delete project they don't own", async () => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);

        const anotherUser = await User.create({
            pc_number: "20220999",
            first_name: "Another",
            last_name: "User",
        });

        const anotherToken = jwt.sign({ userId: anotherUser._id.toString() }, config.JWT_SECRET, {
            expiresIn: "14d",
        });

        await request(app)
            .delete(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${anotherToken}`)
            .expect(403);

        const stillExists = await Project.findById(projectId);
        expect(stillExists).toBeTruthy();
    });

    it("should return 404 if project does not exist", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();

        await request(app)
            .delete(`/api/projects/${nonExistentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });

    it("should return 400 if project id is invalid", async () => {
        await request(app)
            .delete(`/api/projects/invalid-id`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 401 if user is not authenticated", async () => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);

        await request(app)
            .delete(`/api/projects/${projectId}`)
            .expect(401);
    });
});
