import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app"
import mongoose from "mongoose";
import { Skill } from "../src/modules/skills/skills.model";
import setSkills from "../src/scripts/setSkills";
import jwt from 'jsonwebtoken'
import { config } from "../src/config/config";
import { User } from "../src/modules/users/users.model";

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

describe("POST /login", () => {
	it("should return JWT", async () => {
		const res = await request(app)
			.post('/login')
			.send({
				login: 20220467,
				password: "1234"
			})
			.expect(200)
			

		expect(typeof res.body.token).toBe("string");
		const user = await User.findOne({ pc_number: 20220467 });
		expect(user).toBeTruthy()
		if (user) expect((jwt.verify(res.body.token, config.JWT_SECRET) as {userId: string}).userId).toBe(user._id.toString())
	});



	it("should return JWT for existing user", async () => {
		const res = await request(app)
			.post('/login')
			.send({
				login: 20220467,
				password: "1234"
			})
			.expect(200)
		
		expect(typeof res.body.token).toBe("string");
		const user = await User.findOne({ pc_number: 20220467 });
		expect(user).toBeTruthy()
		if (user) expect((jwt.verify(res.body.token, config.JWT_SECRET) as {userId: string}).userId).toBe(user._id.toString())
	});	
})
