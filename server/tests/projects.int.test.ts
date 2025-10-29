import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import setCategories from "../src/scripts/setCategories";
import app from "../src/app";
import request from "supertest";
import { makeCreateProjectPayload } from "./fixtures/projects";
import { beforeAll, afterAll, it, expect, describe } from "@jest/globals";
import path from "path";
import { ProjectStatus } from "../src/modules/projects/projects.model";
import { fail } from "assert";
let mongo: MongoMemoryServer;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri);

    await new setCategories().set();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
});

describe("Create new project", () => { 
    it("should create a new project", async () => {
        const payload = makeCreateProjectPayload();

        const res = await request(app)
          .post("/projects")
          .field("data", JSON.stringify(payload))
          .attach("image", path.join(__dirname, "fixtures/test.png"))
          .attach("image", path.join(__dirname, "fixtures/test.png"));

        // Access the DB using mongoose.model to check saved data
        const ProjectModel = mongoose.connection.collection("projects");
        const dbProject = await ProjectModel.findOne({ _id: new mongoose.Types.ObjectId(res.body.project._id) });

        expect(dbProject).toHaveProperty("title", payload.title);
        expect(dbProject).toHaveProperty("category", payload.category);
        expect(dbProject).toHaveProperty("shortDescription", payload.shortDescription);
        expect(dbProject).toHaveProperty("fullReadme", payload.fullReadme);

        if (dbProject) {
            expect(new Date(dbProject.deadline).toISOString()).toBe(payload.deadline); // compare dates as ISO
            expect(dbProject.skills).toEqual(payload.skills);
            expect(dbProject.ownerId.toString()).toBe(payload.ownerId);
            expect(dbProject.status).toBe(ProjectStatus.PLANNED);
            expect(dbProject._id.toString()).toBe(res.body.project._id.toString().slice(1));
        }
        else {
            fail("Project not found in database");
        }
    
        expect(res.status).toBe(201);  
        expect(res.body).toHaveProperty("project");
        expect(res.body.project._id).toBeDefined();
        expect(res.body.project.title).toBe(payload.title);
        expect(res.body.project.category).toBe(payload.category);
        expect(res.body.project.shortDescription).toBe(payload.shortDescription);
        expect(res.body.project.fullReadme).toBe(payload.fullReadme);
        expect(res.body.project.deadline).toBe(payload.deadline);
        expect(res.body.project.skills).toBe(payload.skills);
        expect(res.body.project.ownerId).toBe(payload.ownerId);
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
})