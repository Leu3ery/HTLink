import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import setCategories from "../src/scripts/setCategories";
import setSkills from "../src/scripts/setSkills";
import app from "../src/app";
import request from "supertest";
import { makeCreateProjectPayload } from "./fixtures/projects";
import {beforeAll, afterAll, it, expect, describe, beforeEach, afterEach} from "@jest/globals";
import path from "path";
import { Project, ProjectStatus } from "../src/modules/projects/projects.model";
import { Category } from "../src/modules/categories/category.model";
import { Skill } from "../src/modules/skills/skills.model";
import { fail } from "assert";
import {User} from "../src/modules/users/users.model";
import jwt from "jsonwebtoken";
import {config} from "../src/config/config";

let projectId: string
let mongo: MongoMemoryServer;
const pc_number = "20220467"
let id: string
let token: string

// Helper function to prepare project payload with category and skills
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
    console.log(payload.skills)
    console.log(skillIds)


    return { payload, skillIds, categoryId: category?._id.toString() || '' };
}

async function createProjectRequest(payload: any, token:string) {
    return request(app)
        .post("/projects")
        .field("data", JSON.stringify(payload))
        .set('Authorization', `Bearer ${token}`)

        .attach("image", path.join(__dirname, "fixtures/test.jpg"))
        .attach("image", path.join(__dirname, "fixtures/test.jpg"));

}

async function ensureProjectExists(base: ReturnType<typeof makeCreateProjectPayload>) {
    const existingData = await Project.findOne({ title: base.title });
    if (!existingData) {
        const { payload } = await prepareProjectPayload(base);

        const res = await createProjectRequest(payload, token);
        expect(res.status).toBe(201);
        projectId = res.body.project._id;
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

async function getAuthToken() {
    const token = await request(app)
        .post('/login')
        .send({login: '20220467', password: 'mypass'});
    return token.body.token;
}

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
    console.log(token)
});

afterEach(async () => {
    await User.deleteMany({});
});

describe("Create new project", () => {
    it("should create a new project", async () => {
        const base = makeCreateProjectPayload();
        const { payload, skillIds } = await prepareProjectPayload(base);

        const res = await createProjectRequest(payload, token);

        // Access the DB using mongoose.model to check saved data
        const ProjectModel = mongoose.connection.collection("projects");
        const dbProject = await ProjectModel.findOne({ _id: new mongoose.Types.ObjectId(res.body.project._id) });

        expect(dbProject).toHaveProperty("title", base.title);
        expect(dbProject?.categoryId?.toString()).toBe(payload.categoryId);
        expect(dbProject).toHaveProperty("shortDescription", payload.shortDescription);
        expect(dbProject).toHaveProperty("fullReadme", payload.fullReadme);

        if (dbProject) {
            expect(new Date(dbProject.deadline).toISOString()).toBe(base.deadline);
            const dbSkillIds = (dbProject.skills || []).map((id: any) => id.toString()).sort();
            expect(dbSkillIds).toEqual(skillIds.sort());
            expect(dbProject.ownerId).toBeDefined();
            expect(dbProject.status).toBe(ProjectStatus.PLANNED);
            expect(dbProject._id.toString()).toBe(res.body.project._id.toString());
        }
        else {
            fail("Project not found in database");
        }

        projectId = res.body.project._id;
    
        expect(res.status).toBe(201);  
        expect(res.body).toHaveProperty("project");
        expect(res.body.project._id).toBeDefined();
        expect(res.body.project.title).toBe(base.title);
        expect(res.body.project.category).toBe(payload.categoryId);
        expect(res.body.project.shortDescription).toBe(base.shortDescription);
        expect(res.body.project.fullReadme).toBe(base.fullReadme);
        expect(new Date(res.body.project.deadline).toISOString()).toBe(base.deadline);
        expect(res.body.project.skills.sort()).toEqual(skillIds.sort());
        expect(res.body.project.ownerId).toBeDefined();
        expect(res.body.project.status).toBe(ProjectStatus.PLANNED);

        // check images
        expect(res.body.project.images).toHaveLength(2);
        expect(res.body.project.images[0]).toHaveProperty("image_path");
        expect(res.body.project.images[0]).toHaveProperty("projectId");
        expect(res.body.project.images[0]).toHaveProperty("createdAt");
        expect(res.body.project.images[0]).toHaveProperty("updatedAt");
        expect(res.body.project.images[1]).toHaveProperty("image_path");
        expect(res.body.project.images[1]).toHaveProperty("projectId");
        expect(res.body.project.images[1]).toHaveProperty("createdAt");
        expect(res.body.project.images[1]).toHaveProperty("updatedAt");
      })

      it("should return 409 if the project already exists", async () => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);

        const { payload } = await prepareProjectPayload(base);

        const res = await createProjectRequest(payload, token);

        expect(res.status).toBe(409);
      })

      it("should return 400 if the payload is invalid", async () => {
        const base = makeCreateProjectPayload();
        const skills = await Skill.find({ name: { $in: base.skills } });
        const skillIds = skills.map(s => s._id.toString());

        const { category: _, skills: __, title: ___, ...baseWithoutCategoryAndSkills } = base;
        const payload = {
            ...baseWithoutCategoryAndSkills,
            categoryId: "some category",
            title: "different title",
            skills: skillIds.join(',') || '',
        };



        const res = await createProjectRequest(payload, token);
        expect(res.status).toBe(400);

        const base2 = makeCreateProjectPayload();
        const { payload: payload2 } = await prepareProjectPayload(base2, { deadline: "not a date" });

        const res2 = await createProjectRequest(payload2, token);
        expect(res2.status).toBe(400);
      })

    it('should update project status by passing project id and new status', async() => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);

        const data = {
            status: ProjectStatus.IN_PROGRESS,
        };
        const res = await request(app)
            .patch(`/projects/${projectId}/update_status`)
            .send(data)
            .expect(200);
        expect(res.body.project.status).toBe(ProjectStatus.IN_PROGRESS);
    });

    it('should return 404 because of wrong project id', async() => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);
        projectId = projectId.slice(1) + "1"
        const data = {
            status: ProjectStatus.IN_PROGRESS,
        };
        const res = await request(app)
            .patch(`/projects/${projectId}/update_status`)
            .send(data)
            .expect(404);
    });
    it('should return 400 because of invalid id', async() => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);
        projectId = projectId + "1"
        const data = {
            status: "wrong status",
        };
        const res = await request(app)
        .patch(`/projects/${projectId}/update_status`)
        .send(data)
        .expect(400);
    })
})

describe("get project by id and by owner id", () => {
    it("should return project by id", async () => {
        const base = makeCreateProjectPayload();
        await ensureProjectExists(base);
        const res = await request(app).get(`/projects/${projectId}`).expect(200);
        expect(res.body.project._id).toBe(projectId);
        expect(res.body.project.title).toBe(base.title);
        expect(res.body.project.shortDescription).toBe(base.shortDescription);
        expect(res.body.project.fullReadme).toBe(base.fullReadme);
        expect(new Date(res.body.project.deadline).toISOString()).toBe(base.deadline);
        expect(res.body.project.ownerId).toBeDefined();
        expect(res.body.project.status).toBe(ProjectStatus.PLANNED);
    })

    it('should return 400 if id is not valid', async() => {
        const res = await request(app).get('/projects/123').expect(400);
    });
})
//
// describe("update project", () => {
//     it("should update project by id", async () => {
//         const base = makeCreateProjectPayload();
//         await ensureProjectExists(base);
//         const { skillIds, categoryId } = await prepareProjectPayload(base);
//         console.log(categoryId)
//         const data = {
//             title: "Updated Title",
//             category: categoryId,
//             shortDescription: "Updated Short Description",
//             fullReadme: "Updated Full Readme",
//             deadline: "2025-11-01",
//             status: ProjectStatus.IN_PROGRESS,
//             skills: skillIds,
//         };
//         const res2 = await request(app).put(`/projects/${projectId}/update_project`).send(data).expect(200);
//         expect(res2.body.project.title).toBe(data.title);
//         expect(res2.body.project.shortDescription).toBe(data.shortDescription);
//         expect(res2.body.project.fullReadme).toBe(data.fullReadme);
//         expect(new Date(res2.body.project.deadline).toISOString()).toBe(data.deadline);
//         expect(res2.body.project.status).toBe(data.status);
//         expect(res2.body.project.skills).toEqual(data.skills);
//     })
// })

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

        const res = await request(app).get("/projects").expect(200);
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.total).toBe(3);
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(10);
        expect(res.body.totalPages).toBe(1);
        const titles = res.body.items.map((i: any) => i.title).sort();
        expect(titles).toEqual([p1.title, p2.title, p3.title].sort());
    });

    it("should filter by search across title", async () => {
        await Project.deleteMany({});
        await createProjectWith({ title: "Unique Searchable Title" });
        await createProjectWith({ title: "Another One" });

        const res = await request(app)
            .get("/projects")
            .query({ search: "searchable" })
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
            .get("/projects")
            .query({ category: mobile?._id.toString() })
            .expect(200);
        expect(res.body.total).toBe(1);
        expect(res.body.items[0].title).toBe("Mobile App");
    });

    it("should filter by status (case-insensitive)", async () => {
        await Project.deleteMany({});
        const created = await createProjectWith({ title: "Status Change" });
        await request(app)
            .patch(`/projects/${created._id}/update_status`)
            .send({ status: ProjectStatus.IN_PROGRESS })
            .expect(200);

        await createProjectWith({ title: "Still Planned" });

        const res = await request(app)
            .get("/projects")
            .query({ status: "in progress" })
            .expect(200);
        expect(res.body.total).toBe(1);
        expect(res.body.items[0].status).toBe(ProjectStatus.IN_PROGRESS);
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
            .get("/projects")
            .query({ skills: [s1?._id.toString(), s2?._id.toString()] })
            .expect(200);
        expect(res.body.total).toBe(1);
        expect(res.body.items[0].title).toBe("Both Skills");
    });

    it("should support pagination via page and limit", async () => {
        await Project.deleteMany({});
        await createProjectWith({ title: "Proj1" });
        await createProjectWith({ title: "Proj2" });
        await createProjectWith({ title: "Proj3" });

        const res = await request(app)
            .get("/projects")
            .query({ limit: 2, page: 2 })
            .expect(200);
        expect(res.body.page).toBe(2);
        expect(res.body.limit).toBe(2);
        expect(res.body.total).toBe(3);
        expect(res.body.totalPages).toBe(2);
        expect(res.body.items.length).toBe(1);
    });

    it("should return 400 for invalid status filter", async () => {
        const res = await request(app)
            .get("/projects")
            .query({ status: "not_a_status" })
            .expect(400);
        expect(res.status).toBe(400);
    });

    it("rejects invalid query params with 400 (limit/page/category/skills)", async () => {

        await request(app).get("/projects").query({ page: 0 }).expect(400);
        await request(app).get("/projects").query({ limit: -5 }).expect(400);
        await request(app).get("/projects").query({ page: "abc" }).expect(400);
        await request(app).get("/projects").query({ limit: "abc" }).expect(400);
    

        await request(app).get("/projects").query({ category: "not-an-id" }).expect(400);
    

        await request(app).get("/projects").query({ skills: ["ok", "not-an-id"] }).expect(400);
      });

    
      it("search is case-insensitive and trims whitespace", async () => {
        await createProjectWith({ title: "Unique Searchable Title" });
        const res = await request(app).get("/projects").query({ search: "  SEARCHABLE  " }).expect(200);
        expect(res.body.total).toBe(1);
        expect(res.body.items[0].title).toBe("Unique Searchable Title");
      });
});

