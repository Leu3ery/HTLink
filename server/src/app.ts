import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { config } from "./config/config";

const app = express();

// limiter
const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 100,
	message: "Too many requests from this IP, please try again after 1 minutes",
});

// Public dir
export const publicDir = path.join(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
	fs.mkdirSync(publicDir, { recursive: true });
	console.log(`Created missing directory: ${publicDir}`);
}

app.use("/public", express.static(publicDir));
app.use(limiter);
app.use(
	cors({
		origin: config.DOMEN,
	})
);
app.use(express.json());

// ROUTES
import skills from "./modules/skills/skills.routes";
import users from "./modules/users/users.routes";
import login from "./modules/users/users.auth.routes"
import projects from "./modules/projects/projects.router";
import categories from "./modules/categories/category.routes";

app.use('/api/', login)
app.use('/api/skills', skills)
app.use('/api/users', users)
app.use('/api/projects', projects)
app.use('/api/categories', categories)


// Additional handlers
import errorHandler from './common/middlewares/errorHandlerMiddleware'
import notFound from "./common/middlewares/notFoundMiddleware";

app.use(notFound);
app.use(errorHandler);

export default app;
