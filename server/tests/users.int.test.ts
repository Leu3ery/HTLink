import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app, { publicDir } from "../src/app";
import jwt from "jsonwebtoken";
import { config } from "../src/config/config";
import { User } from "../src/modules/users/users.model";
import UsersService from "../src/modules/users/users.service";
import setSkills from "../src/scripts/setSkills";
import { beforeAll, afterAll, it, expect, describe, jest, afterEach, beforeEach } from "@jest/globals";
import deleteFile from "../src/common/utils/utils.deleteFile";
import isPhotoExist from "../src/common/utils/utils.isPhotoExist";
import path from "path";
import { Skill } from "../src/modules/skills/skills.model";

let mongo: MongoMemoryServer;
let token: string;
let id: string;
let pc_number = 20220467;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);

  jest.spyOn(UsersService, "isUserValid").mockResolvedValue(true);

  await new setSkills(["Express Js", "Angular", "Python"]).set();
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
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
  jest.restoreAllMocks();
});

describe("POST /api/login", () => {
  it("should return JWT", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({
        login: pc_number,
        password: "1234",
      })
      .expect(200);

    expect(typeof res.body.token).toBe("string");
	const user = await User.findOne({ pc_number: 20220467 });
	expect(user).toBeTruthy()
	if (user) expect((jwt.verify(res.body.token, config.JWT_SECRET) as {userId: string}).userId).toBe(user._id.toString())
  });
});


describe("PATCH /api/users/me", () => {
	it("should update user", async () => {
		const skills = await Skill.find({})
		const res = await request(app)
			.patch('/api/users/me')
			.send({
				first_name: "John",
				last_name: "Doe",
				description: "I am a student",
				department: "IF",
				class: "3BHIF",
				github_link: "https://github.com/john-doe",
				skills: [skills[0]._id.toString()],
			})
			.set('Authorization', `Bearer ${token}`)
			.expect(200)

		expect(res.body.user.first_name).toBe("John");
		expect(res.body.user.last_name).toBe("Doe");
		expect(res.body.user.description).toBe("I am a student");
		expect(res.body.user.department).toBe("IF");
		expect(res.body.user.class).toBe("3BHIF");
		expect(res.body.user.github_link).toBe("https://github.com/john-doe");
		expect(res.body.user.skills.length).toBe(1)
		expect(res.body.user.skills[0].name).toBe("Express Js")
	})

	it("PATCH /api/users/me → 401 without token", async () => {
		await request(app).patch("/api/users/me").send({ first_name: "X" }).expect(401);
	});

	it("should upload photo and delete it if new uploaded", async () => {
		const res = await request(app)
			.patch('/api/users/me')
			.attach('photo', path.resolve(__dirname, 'public/test.png'))
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
		
		expect(isPhotoExist(res.body.user.photo_path)).toBe(true)

		const photoPath = res.body.user.photo_path

		const res2 = await request(app)
			.patch('/api/users/me')
			.attach('photo', path.resolve(__dirname, 'public/test_copy.png'))
			.set('Authorization', `Bearer ${token}`)
			.expect(200)

		expect(isPhotoExist(res2.body.user.photo_path)).toBe(true)
		expect(isPhotoExist(photoPath)).toBe(false)

		await deleteFile(res2.body.user.photo_path)
		expect(isPhotoExist(res2.body.user.photo_path)).toBe(false)
	})

	it("should return error", async () => {
		await request(app)
			.patch('/api/users/me')
			.send({
				first_name: "J",
			})
			.set('Authorization', `Bearer ${token}`)
			.expect(400)
		
		await request(app)
			.patch('/api/users/me')
			.send({
				department: "IFF"
			})
			.set('Authorization', `Bearer ${token}`)
			.expect(400)
			
		await request(app)
			.patch('/api/users/me')
			.send({
				class: "3BHIFFF"
			})
			.set('Authorization', `Bearer ${token}`)
			.expect(400)
		
		await request(app)
			.patch('/api/users/me')
			.send({
				role: "admin"
			})
			.set('Authorization', `Bearer ${token}`)
			.expect(400)
	})
})

describe("GET /api/users/me", () => {
	it("should return me", async () => {
		const res = await request(app)
			.get("/api/users/me")
			.set('Authorization', `Bearer ${token}`)
			.expect(200);
		
		expect(res.body.user.pc_number).toBe(pc_number)
		expect(res.body.user.id).toBe(id)
		expect(res.body.user.first_name).toBe("Test")
	})

	it("GET /api/users/me → 401 with invalid token", async () => {
		await request(app)
		  .get("/api/users/me")
		  .set("Authorization", "Bearer invalid.token")
		  .expect(401);
	});
})

describe(`GET /api/users/:id`, () => {
	it("should return me", async () => {
		const res = await request(app)
			.get(`/api/users/${id}`)
			.expect(200);
		
		expect(res.body.user.pc_number).toBe(pc_number)
		expect(res.body.user.id).toBe(id)
		expect(res.body.user.first_name).toBe("Test")
	})

	it("GET /api/users/:id → 404 if not found", async () => {
		const nonExistingId = new mongoose.Types.ObjectId().toString();
		await request(app).get(`/api/users/${nonExistingId}`).expect(404);
	});

	it("GET /api/users/:id → 400 for invalid ObjectId", async () => {
		await request(app).get("/api/users/not-an-objectid").expect(400);
	});
})


describe("GET /api/users/", () => {
	it("should return users filtered by nameContains (case-insensitive)", async () => {
		await User.create([
			{ pc_number: 1, first_name: 'Alice', last_name: 'Smith', department: 'IF', class: '1AHIF' },
			{ pc_number: 2, first_name: 'Alicia', last_name: 'Brown', department: 'WI', class: '2BHIF' },
			{ pc_number: 3, first_name: 'Bob', last_name: 'Johnson', department: 'IF', class: '3CHIF' },
		])

		const res = await request(app)
			.get('/api/users')
			.query({ nameContains: 'ali' })
			.expect(200)

		expect(Array.isArray(res.body.users)).toBe(true)
		expect(res.body.users.length).toBe(2)
		const names = res.body.users.map((u: any) => u.first_name)
		expect(names.sort()).toEqual(['Alice', 'Alicia'])
	})

	it("should filter by department and class", async () => {
		await User.create([
			{ pc_number: 10, first_name: 'Charlie', last_name: 'Blue', department: 'IF', class: '5DHIF' },
			{ pc_number: 11, first_name: 'Diana', last_name: 'Green', department: 'WI', class: '4AHIF' },
		])

		const res = await request(app)
			.get('/api/users')
			.query({ department: 'IF', class: '5DHIF' })
			.expect(200)

		expect(res.body.users.length).toBe(1)
		expect(res.body.users[0].first_name).toBe('Charlie')
		expect(res.body.users[0].department).toBe('IF')
		expect(res.body.users[0].class).toBe('5DHIF')
	})

	it("should filter by pc_id", async () => {
		await User.create({ pc_number: 22, first_name: 'Eve', last_name: 'White', department: 'MB', class: '2CHIF' })

		const res = await request(app)
			.get('/api/users')
			.query({ pc_id: 22 })
			.expect(200)

		expect(res.body.users.length).toBe(1)
		expect(res.body.users[0].pc_number).toBe(22)
		expect(res.body.users[0].first_name).toBe('Eve')
	})

	it("should respect pagination with offset and limit", async () => {
		await User.create([
			{ pc_number: 31, first_name: 'Anna', last_name: 'AAA', department: 'IF', class: '1BHIF' },
			{ pc_number: 32, first_name: 'Anabel', last_name: 'BBB', department: 'IF', class: '1BHIF' },
			{ pc_number: 33, first_name: 'Anastasia', last_name: 'CCC', department: 'IF', class: '1BHIF' },
		])

		const firstPage = await request(app)
			.get('/api/users')
			.query({ nameContains: 'ana', limit: 1 })
			.expect(200)

		expect(firstPage.body.users.length).toBe(1)

		const secondPage = await request(app)
			.get('/api/users')
			.query({ nameContains: 'ana', limit: 1, offset: 1 })
			.expect(200)

		expect(secondPage.body.users.length).toBe(1)
		// ensure different item on the second page
		expect(secondPage.body.users[0].id).not.toBe(firstPage.body.users[0].id)
	})
})