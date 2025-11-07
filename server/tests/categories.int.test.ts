import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app"
import mongoose from "mongoose";
import { Category } from "../src/modules/categories/category.model";
import setCategories from "../src/scripts/setCategories";
import { beforeAll, afterAll, it, expect, describe } from "@jest/globals";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);

  await new setCategories(["Web development", "Mobile development","Design"]).set();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

describe("GET /api/categories", () => {
  it("should return all categories from DB", async () => {
    const res = await request(app)
      .get("/api/categories")
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);

    const names = res.body.map((s: any) => s.name);
    expect(names).toContain("Web development");
    expect(names).toContain("Mobile development");
    expect(names).toContain("Design");
  });

  it("should return empty array if no categories exist", async () => {
    await Category.deleteMany({});

    const res = await request(app)
      .get("/api/categories")
      .expect(200);

    expect(res.body).toEqual([]);
  });
});
