import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import setSkills from "../src/scripts/setSkills";
import app from "../src/app";
import request from "supertest";
import { beforeAll, afterAll, it, expect, describe, beforeEach, afterEach } from "@jest/globals";
import path from "path";
import { Offer } from "../src/modules/offers/offers.model";
import { Skill } from "../src/modules/skills/skills.model";
import { User } from "../src/modules/users/users.model";
import jwt from "jsonwebtoken";
import { config } from "../src/config/config";
import isPhotoExist from "../src/common/utils/utils.isPhotoExist";
import deleteFile from "../src/common/utils/utils.deleteFile";

let offerId: string;
let mongo: MongoMemoryServer;
const pc_number = "20220467";
let id: string;
let token: string;
let skillIds: string[] = [];

export function makeCreateOfferPayload(overrides: Record<string, any> = {}) {
    const uniqueSuffix = Math.random().toString(36).slice(2, 6);

    const base = {
        title: "Test Offer " + uniqueSuffix,
        description: "A detailed description for the test offer. This offer provides great services.",
        phoneNumber: "+1234567890",
        price: 100,
        skills: skillIds.length > 0 ? skillIds : [],
    };

    return { ...base, ...overrides };
}

async function prepareOfferPayload(base: ReturnType<typeof makeCreateOfferPayload>, overrides?: any) {
    const skills = await Skill.find({});
    const skillIds = skills.map(s => s._id.toString());

    const { skills: __, ...baseWithoutSkills } = base;
    const payload = {
        ...baseWithoutSkills,
        skills: skillIds.length > 0 ? skillIds : [],
        ...overrides,
    };

    return { payload, skillIds };
}

async function createOfferRequest(payload: any, token: string, attachPhoto = false) {
    const req = request(app)
        .post("/api/offers")
        .field("title", payload.title)
        .field("description", payload.description)
        .field("phoneNumber", payload.phoneNumber)
        .set('Authorization', `Bearer ${token}`);

    if (payload.price !== undefined) {
        req.field("price", payload.price.toString());
    }

    // Handle skills array properly for multipart form data
    if (Array.isArray(payload.skills) && payload.skills.length > 0) {
        payload.skills.forEach((skill: string) => {
            if (skill) {
                req.field("skills", skill);
            }
        });
    } else if (payload.skills && !Array.isArray(payload.skills)) {
        req.field("skills", payload.skills);
    }

    if (attachPhoto) {
        req.attach("photo_path", path.join(__dirname, "public/test.png"));
    }

    return req;
}

async function ensureOfferExists(base: ReturnType<typeof makeCreateOfferPayload>) {
    const existingData = await Offer.findOne({ title: base.title });
    if (!existingData) {
        const { payload } = await prepareOfferPayload(base);

        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(201);
        offerId = res.body.offer.id;
    } else {
        offerId = existingData._id.toString();
    }
}

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri);

    await new setSkills(["Express Js", "Angular", "Python"]).set();
    const skills = await Skill.find({});
    skillIds = skills.map(s => s._id.toString());
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

    id = user._id.toString();

    token = jwt.sign({ userId: user._id.toString() }, config.JWT_SECRET, {
        expiresIn: "14d",
    });
});

afterEach(async () => {
    await User.deleteMany({});
    await Offer.deleteMany({});
});

describe("Create new offer (POST /api/offers)", () => {
    it("should create a new offer", async () => {
        const base = makeCreateOfferPayload();
        const { payload } = await prepareOfferPayload(base);

        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(201);

        expect(res.body.offer).toHaveProperty("id");
        expect(res.body.offer.title).toBe(base.title);
        expect(res.body.offer.description).toBe(base.description);
        expect(res.body.offer.phoneNumber).toBe(base.phoneNumber);
        expect(res.body.offer.price).toBe(base.price);
        expect(res.body.offer.ownerId).toBeDefined();
        expect(res.body.offer.ownerId.id).toBe(id);
        expect(res.body.offer.skills).toBeDefined();
        expect(Array.isArray(res.body.offer.skills)).toBe(true);
        expect(res.body.offer.createdAt).toBeDefined();
        expect(res.body.offer.updatedAt).toBeDefined();
    });

    it("should create an offer without price", async () => {
        const base = makeCreateOfferPayload({ price: undefined });
        const { payload } = await prepareOfferPayload(base);

        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(201);

        expect(res.body.offer.price).toBeUndefined();
    });

    it("should create an offer with photo", async () => {
        const base = makeCreateOfferPayload();
        const { payload } = await prepareOfferPayload(base);

        const res = await createOfferRequest(payload, token, true);
        expect(res.status).toBe(201);

        expect(res.body.offer.photo_path).toBeDefined();
        expect(isPhotoExist(res.body.offer.photo_path)).toBe(true);
        await deleteFile(res.body.offer.photo_path);
    });

    it("should return 400 if payload is invalid (title too long)", async () => {
        const base = makeCreateOfferPayload({ title: "A".repeat(101) });
        const { payload } = await prepareOfferPayload(base);

        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(400);
    });

    it("should return 400 if description is too long", async () => {
        const base = makeCreateOfferPayload({ description: "A".repeat(1001) });
        const { payload } = await prepareOfferPayload(base);

        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(400);
    });

    it("should return 400 if phone number is invalid", async () => {
        const base = makeCreateOfferPayload({ phoneNumber: "123" });
        const { payload } = await prepareOfferPayload(base);

        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(400);
    });

    it("should return 400 if skills are missing", async () => {
        const base = makeCreateOfferPayload();
        const { payload } = await prepareOfferPayload(base, { skills: undefined });

        const res = await request(app)
            .post("/api/offers")
            .send({
                title: base.title,
                description: base.description,
                phoneNumber: base.phoneNumber,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
    });

    it("should return 400 if skill IDs are invalid", async () => {
        const base = makeCreateOfferPayload();
        const { payload } = await prepareOfferPayload(base, {
            skills: [new mongoose.Types.ObjectId().toString()],
        });

        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(400);
    });

    it("should return 400 if photo_path is provided in body", async () => {
        const base = makeCreateOfferPayload();
        const { payload } = await prepareOfferPayload(base);

        const res = await request(app)
            .post("/api/offers")
            .send({
                ...payload,
                photo_path: "test.png",
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
        const base = makeCreateOfferPayload();
        const { payload } = await prepareOfferPayload(base);

        const res = await request(app)
            .post("/api/offers")
            .send(payload);

        expect(res.status).toBe(401);
    });

    it("should accept valid phone number formats", async () => {
        const validPhones = ["+1234567890", "1234567890", "+1234567890123"];

        for (const phone of validPhones) {
            const base = makeCreateOfferPayload({ phoneNumber: phone });
            const { payload } = await prepareOfferPayload(base);

            const res = await createOfferRequest(payload, token);
            expect(res.status).toBe(201);
            expect(res.body.offer.phoneNumber).toBe(phone);

            await Offer.deleteOne({ _id: res.body.offer.id });
        }
    });
});

describe("Get offers (GET /api/offers)", () => {
    async function createOfferWith(overrides: Record<string, any> = {}) {
        const base = makeCreateOfferPayload(overrides.title ? { title: overrides.title } : {});
        const { payload } = await prepareOfferPayload(base, overrides);
        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(201);
        return res.body.offer;
    }

    it("should list offers with defaults and correct pagination", async () => {
        await Offer.deleteMany({});
        const o1 = await createOfferWith({ title: "Alpha Offer" });
        const o2 = await createOfferWith({ title: "Beta Offer" });
        const o3 = await createOfferWith({ title: "Gamma Offer" });

        const res = await request(app)
            .get("/api/offers")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(res.body.offers)).toBe(true);
        expect(res.body.offers.length).toBeGreaterThanOrEqual(3);
        for (const offer of res.body.offers) {
            expect(offer).toHaveProperty("id");
            expect(offer).toHaveProperty("title");
            expect(offer).toHaveProperty("description");
            expect(offer).toHaveProperty("phoneNumber");
            expect(offer).toHaveProperty("ownerId");
            expect(offer).toHaveProperty("skills");
        }
    });

    it("should filter by title (case-insensitive)", async () => {
        await Offer.deleteMany({});
        await createOfferWith({ title: "Unique Searchable Offer" });
        await createOfferWith({ title: "Another One" });

        const res = await request(app)
            .get("/api/offers")
            .query({ title: "searchable" })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offers.length).toBeGreaterThanOrEqual(1);
        expect(res.body.offers[0].title).toContain("Searchable");
    });

    it("should filter by skills", async () => {
        await Offer.deleteMany({});
        const skills = await Skill.find({});
        expect(skills.length).toBeGreaterThanOrEqual(2);
        
        const skill1 = skills[0]?._id.toString();
        const skill2 = skills[1]?._id.toString();
        
        expect(skill1).toBeDefined();
        expect(skill2).toBeDefined();

        await createOfferWith({ skills: [skill1] });
        await createOfferWith({ skills: [skill1, skill2] });
        await createOfferWith({ skills: [skill2] });

        const res = await request(app)
            .get("/api/offers")
            .query({ skills: [skill1] })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offers.length).toBeGreaterThanOrEqual(2);
        res.body.offers.forEach((offer: any) => {
            const offerSkillIds = offer.skills.map((s: any) => s.id);
            expect(offerSkillIds).toContain(skill1);
        });
    });

    it("should support pagination via offset and limit", async () => {
        await Offer.deleteMany({});
        await createOfferWith({ title: "Offer 1" });
        await createOfferWith({ title: "Offer 2" });
        await createOfferWith({ title: "Offer 3" });

        const res = await request(app)
            .get("/api/offers")
            .query({ limit: 2, offset: 0 })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offers.length).toBeLessThanOrEqual(2);
    });

    it("should enforce max limit of 50", async () => {
        await Offer.deleteMany({});
        await createOfferWith({ title: "Test Offer" });

        const res = await request(app)
            .get("/api/offers")
            .query({ limit: 100 })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 400 for invalid query params", async () => {
        await request(app)
            .get("/api/offers")
            .query({ offset: -1 })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        await request(app)
            .get("/api/offers")
            .query({ limit: 0 })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        await request(app)
            .get("/api/offers")
            .query({ title: "A".repeat(101) })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 401 if user is not authenticated", async () => {
        await request(app)
            .get("/api/offers")
            .expect(401);
    });

    it("should return offers sorted by createdAt (newest first)", async () => {
        await Offer.deleteMany({});
        const o1 = await createOfferWith({ title: "First Offer" });
        await new Promise(resolve => setTimeout(resolve, 10));
        const o2 = await createOfferWith({ title: "Second Offer" });
        await new Promise(resolve => setTimeout(resolve, 10));
        const o3 = await createOfferWith({ title: "Third Offer" });

        const res = await request(app)
            .get("/api/offers")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const titles = res.body.offers.map((o: any) => o.title);
        expect(titles[0]).toBe("Third Offer");
    });
});

describe("Get my offers (GET /api/offers/my)", () => {
    async function createOfferWith(overrides: Record<string, any> = {}) {
        const base = makeCreateOfferPayload(overrides.title ? { title: overrides.title } : {});
        const { payload } = await prepareOfferPayload(base, overrides);
        const res = await createOfferRequest(payload, token);
        expect(res.status).toBe(201);
        return res.body.offer;
    }

    it("should return all offers owned by the authenticated user", async () => {
        await Offer.deleteMany({});

        await createOfferWith({ title: "My Offer 1" });
        await createOfferWith({ title: "My Offer 2" });
        await createOfferWith({ title: "My Offer 3" });

        const res = await request(app)
            .get("/api/offers/my")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offers).toBeDefined();
        expect(Array.isArray(res.body.offers)).toBe(true);
        expect(res.body.offers.length).toBe(3);

        res.body.offers.forEach((offer: any) => {
            expect(offer.ownerId.id).toBe(id);
            expect(offer).toHaveProperty('id');
            expect(offer).toHaveProperty('title');
            expect(offer).toHaveProperty('description');
            expect(offer).toHaveProperty('phoneNumber');
        });

        const titles = res.body.offers.map((o: any) => o.title);
        expect(titles).toContain("My Offer 1");
        expect(titles).toContain("My Offer 2");
        expect(titles).toContain("My Offer 3");
    });

    it("should return empty array when user has no offers", async () => {
        await Offer.deleteMany({});

        const res = await request(app)
            .get("/api/offers/my")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offers).toBeDefined();
        expect(Array.isArray(res.body.offers)).toBe(true);
        expect(res.body.offers.length).toBe(0);
    });

    it("should only return offers owned by the authenticated user", async () => {
        await Offer.deleteMany({});

        // Create another user
        const anotherUser = await User.create({
            pc_number: "20220888",
            first_name: "Another",
            last_name: "User",
        });
        const anotherUserId = anotherUser._id.toString();
        const anotherToken = jwt.sign({ userId: anotherUserId }, config.JWT_SECRET, {
            expiresIn: "14d",
        });

        // Create offers for both users
        await createOfferWith({ title: "User 1 Offer" }); // owned by original user

        // Create offer for another user
        const base2 = makeCreateOfferPayload({ title: "User 2 Offer" });
        const { payload: payload2 } = await prepareOfferPayload(base2);
        await createOfferRequest(payload2, anotherToken);

        // Fetch offers for original user
        const res = await request(app)
            .get("/api/offers/my")
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offers.length).toBe(1);
        expect(res.body.offers[0].title).toBe("User 1 Offer");
        expect(res.body.offers[0].ownerId.id).toBe(id);
    });

    it("should return 401 if user is not authenticated", async () => {
        await request(app)
            .get("/api/offers/my")
            .expect(401);
    });
});

describe("Update offer (PATCH /api/offers/:id)", () => {
    it("should successfully update all offer fields", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        const newSkills = await Skill.find({ name: { $in: ["Python"] } });
        const newSkillIds = newSkills.map(s => s._id.toString());

        const updateData = {
            title: "Updated Offer Title",
            description: "This is an updated description for the offer.",
            phoneNumber: "+9876543210",
            price: 200,
            skills: newSkillIds,
        };

        const res = await request(app)
            .patch(`/api/offers/${offerId}`)
            .send(updateData)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offer).toBeDefined();
        expect(res.body.offer.title).toBe(updateData.title);
        expect(res.body.offer.description).toBe(updateData.description);
        expect(res.body.offer.phoneNumber).toBe(updateData.phoneNumber);
        expect(res.body.offer.price).toBe(updateData.price);
        expect(res.body.offer.skills.length).toBe(newSkillIds.length);
    });

    it("should update offer with photo", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        const res = await request(app)
            .patch(`/api/offers/${offerId}`)
            .attach("photo_path", path.join(__dirname, "public/test.png"))
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offer.photo_path).toBeDefined();
        expect(isPhotoExist(res.body.offer.photo_path)).toBe(true);

        const photoPath = res.body.offer.photo_path;

        // Update with new photo - old should be deleted
        const res2 = await request(app)
            .patch(`/api/offers/${offerId}`)
            .attach("photo_path", path.join(__dirname, "public/test_copy.png"))
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(isPhotoExist(res2.body.offer.photo_path)).toBe(true);
        expect(isPhotoExist(photoPath)).toBe(false);

        await deleteFile(res2.body.offer.photo_path);
    });

    it("should partially update offer fields", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        const updateData = {
            title: "Only Title Updated",
        };

        const res = await request(app)
            .patch(`/api/offers/${offerId}`)
            .send(updateData)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offer.title).toBe(updateData.title);
        expect(res.body.offer.description).toBe(base.description);
        expect(res.body.offer.phoneNumber).toBe(base.phoneNumber);
    });

    it("should return 400 if validation fails", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        const updateData = {
            title: "A".repeat(101), // Too long
        };

        await request(app)
            .patch(`/api/offers/${offerId}`)
            .send(updateData)
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 404 if offer does not exist", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();

        const skills = await Skill.find({});
        const skillIds = skills.map(s => s._id.toString());

        const updateData = {
            title: "Test Title",
            skills: skillIds,
        };

        await request(app)
            .patch(`/api/offers/${nonExistentId}`)
            .send(updateData)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });

    it("should return 403 if user tries to update offer they don't own", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        const anotherUser = await User.create({
            pc_number: "20220999",
            first_name: "Another",
            last_name: "User",
        });

        const anotherToken = jwt.sign({ userId: anotherUser._id.toString() }, config.JWT_SECRET, {
            expiresIn: "14d",
        });

        const updateData = {
            title: "Hacked Title",
        };

        await request(app)
            .patch(`/api/offers/${offerId}`)
            .send(updateData)
            .set('Authorization', `Bearer ${anotherToken}`)
            .expect(403);
    });

    it("should return 400 if offer id is invalid", async () => {
        await request(app)
            .patch(`/api/offers/invalid-id`)
            .send({ title: "Test" })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 400 if photo_path is provided in body", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        const res = await request(app)
            .patch(`/api/offers/${offerId}`)
            .send({
                title: "Updated",
                photo_path: "test.png",
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 400 if skill IDs are invalid", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        const updateData = {
            skills: [new mongoose.Types.ObjectId().toString()],
        };

        await request(app)
            .patch(`/api/offers/${offerId}`)
            .send(updateData)
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 401 if user is not authenticated", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        await request(app)
            .patch(`/api/offers/${offerId}`)
            .send({ title: "Updated" })
            .expect(401);
    });
});

describe("Delete offer (DELETE /api/offers/:id)", () => {
    it("should successfully delete an offer owned by the user", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        // Verify offer exists
        const existsBefore = await Offer.findById(offerId);
        expect(existsBefore).toBeTruthy();

        const res = await request(app)
            .delete(`/api/offers/${offerId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.offer).toBeDefined();
        expect(res.body.offer.id).toBe(offerId);

        const existsAfter = await Offer.findById(offerId);
        expect(existsAfter).toBeNull();
    });

    it("should delete photo file when deleting offer with photo", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        // Add photo to offer
        const updateRes = await request(app)
            .patch(`/api/offers/${offerId}`)
            .attach("photo_path", path.join(__dirname, "public/test.png"))
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const photoPath = updateRes.body.offer.photo_path;
        expect(isPhotoExist(photoPath)).toBe(true);

        // Delete offer
        await request(app)
            .delete(`/api/offers/${offerId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(isPhotoExist(photoPath)).toBe(false);
    });

    it("should return 403 if user tries to delete offer they don't own", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        const anotherUser = await User.create({
            pc_number: "20220999",
            first_name: "Another",
            last_name: "User",
        });

        const anotherToken = jwt.sign({ userId: anotherUser._id.toString() }, config.JWT_SECRET, {
            expiresIn: "14d",
        });

        await request(app)
            .delete(`/api/offers/${offerId}`)
            .set('Authorization', `Bearer ${anotherToken}`)
            .expect(403);

        const stillExists = await Offer.findById(offerId);
        expect(stillExists).toBeTruthy();
    });

    it("should return 404 if offer does not exist", async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();

        await request(app)
            .delete(`/api/offers/${nonExistentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
    });

    it("should return 400 if offer id is invalid", async () => {
        await request(app)
            .delete(`/api/offers/invalid-id`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it("should return 401 if user is not authenticated", async () => {
        const base = makeCreateOfferPayload();
        await ensureOfferExists(base);

        await request(app)
            .delete(`/api/offers/${offerId}`)
            .expect(401);
    });
});

