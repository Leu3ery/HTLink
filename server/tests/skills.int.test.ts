import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app"
import mongoose from "mongoose";
import { Skill } from "../src/modules/skills/skills.model";
import setSkills from "../src/scripts/setSkills";
import { beforeAll, afterAll, it, expect, describe } from "@jest/globals";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);

  await new setSkills(["Express Js", "Angular", "Python"]).set();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

describe("GET /skills", () => {
  it("should return all skills from DB", async () => {
    const res = await request(app)
      .get("/skills")
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);

    const names = res.body.map((s: any) => s.name);
    expect(names).toContain("Express Js");
    expect(names).toContain("Angular");
    expect(names).toContain("Python");
  });

  it("should return empty array if no skills exist", async () => {
    await Skill.deleteMany({});

    const res = await request(app)
      .get("/skills")
      .expect(200);

    expect(res.body).toEqual([]);
  });
});
