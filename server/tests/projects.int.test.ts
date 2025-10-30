import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import setCategories from "../src/scripts/setCategories";
import setSkills from "../src/scripts/setSkills";
import app from "../src/app";
import request from "supertest";
import { makeCreateProjectPayload } from "./fixtures/projects";
import { beforeAll, afterAll, it, expect, describe } from "@jest/globals";
import path from "path";
import { Project, ProjectStatus } from "../src/modules/projects/projects.model";
import { Category } from "../src/modules/categories/category.model";
import { Skill } from "../src/modules/skills/skills.model";
import { fail } from "assert";
let mongo: MongoMemoryServer;

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

describe("Create new project", () => { 
    it("should create a new project", async () => {
        const base = makeCreateProjectPayload();

        const category = await Category.findOne({ name: base.category });
        const skills = await Skill.find({ name: { $in: base.skills } });
        const skillIds = skills.map(s => s._id.toString());

        const { category: _, skills: __, ...baseWithoutCategoryAndSkills } = base;
        const payload = {
            ...baseWithoutCategoryAndSkills,
            categoryId: category?._id.toString() || '',
            skills: skillIds.join(','),
        };

        const res = await request(app)
          .post("/projects")
          .field("data", JSON.stringify(payload))
          .attach("image", path.join(__dirname, "fixtures/test.jpg"))
          .attach("image", path.join(__dirname, "fixtures/test.jpg"));

        // Access the DB using mongoose.model to check saved data
        const ProjectModel = mongoose.connection.collection("projects");
        const dbProject = await ProjectModel.findOne({ _id: new mongoose.Types.ObjectId(res.body.project._id) });

        expect(dbProject).toHaveProperty("title", base.title);
        expect(dbProject?.categoryId?.toString()).toBe(payload.categoryId);
        expect(dbProject).toHaveProperty("shortDescription", payload.shortDescription);
        expect(dbProject).toHaveProperty("fullReadme", payload.fullReadme);

        if (dbProject) {
            expect(new Date(dbProject.deadline).toISOString()).toBe(base.deadline); // compare dates as ISO
            const dbSkillIds = (dbProject.skills || []).map((id: any) => id.toString()).sort();
            expect(dbSkillIds).toEqual(skillIds.sort());
            expect(dbProject.ownerId).toBeDefined();
            expect(dbProject.status).toBe(ProjectStatus.PLANNED);
            expect(dbProject._id.toString()).toBe(res.body.project._id.toString());
        }
        else {
            fail("Project not found in database");
        }
    
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
        const existingData = await Project.findOne({ title: base.title });
        if (!existingData) {
            const category = await Category.findOne({ name: base.category });
            const skills = await Skill.find({ name: { $in: base.skills } });
            const skillIds = skills.map(s => s._id.toString());

            const { category: _, skills: __, ...baseWithoutCategoryAndSkills } = base;
            const payload = {
                ...baseWithoutCategoryAndSkills,
                categoryId: category?._id.toString() || '',
                skills: skillIds.join(','),
            };

            const res = await request(app)
            .post("/projects")
            .field("data", JSON.stringify(payload))
            .attach("image", path.join(__dirname, "fixtures/test.jpg"))
            .attach("image", path.join(__dirname, "fixtures/test.jpg"));
        }
        const category = await Category.findOne({ name: base.category });
        const skills = await Skill.find({ name: { $in: base.skills } });
        const skillIds = skills.map(s => s._id.toString());

        const { category: _, skills: __, ...baseWithoutCategoryAndSkills } = base;
        const payload = {
            ...baseWithoutCategoryAndSkills,
            categoryId: category?._id.toString() || '',
            skills: skillIds.join(','),
        };

        const res = await request(app)
            .post("/projects")
            .field("data", JSON.stringify(payload))
            .attach("image", path.join(__dirname, "fixtures/test.jpg"))
            .attach("image", path.join(__dirname, "fixtures/test.jpg"));

        expect(res.status).toBe(409);
      })

      it("should return 400 if the payload is invalid", async () => {
        const base = makeCreateProjectPayload();
        const title = "different title";

        const category = "some category";
        const skills = await Skill.find({ name: { $in: base.skills } });
        const skillIds = skills.map(s => s._id.toString());

        const { category: _, skills: __, title: ___, ...baseWithoutCategoryAndSkills } = base;
        const payload = {
            ...baseWithoutCategoryAndSkills,
            categoryId: category,
            title: title,
            skills: skillIds.join(',') || '',
        };

        const res = await request(app)
            .post("/projects")
            .field("data", JSON.stringify(payload))
            .attach("image", path.join(__dirname, "fixtures/test.jpg"))
            .attach("image", path.join(__dirname, "fixtures/test.jpg"));

        expect(res.status).toBe(400);

        const base2 = makeCreateProjectPayload();

        const category2 = await Category.findOne({ name: base2.category });
        const deadline = "not a date";



        const { category: _2, skills: __2, title: ___2, deadline: _____2, ...baseWithoutCategoryAndSkillsAndDeadlineAndTitle } = base2;
        const payload2 = {
            ...baseWithoutCategoryAndSkillsAndDeadlineAndTitle,
            categoryId: category2?._id.toString() || '',
            deadline: deadline,
            skills: skillIds.join(',') || '',
        };

        const res2 = await request(app)
            .post("/projects")
            .field("data", JSON.stringify(payload2))
            .attach("image", path.join(__dirname, "fixtures/test.jpg"))
            .attach("image", path.join(__dirname, "fixtures/test.jpg"));

        expect(res2.status).toBe(400);
      })
      
    })