import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ErrorWrapper } from "../../common/utils/utils.wrappers";
import AuthController from "./auth.controller";

const router = Router()

const sendCodeLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: process.env.NODE_ENV === 'test' ? 100 : 3, // Higher limit for tests
	message: "Too many code requests from this IP, please try again after 15 minutes",
	standardHeaders: true, 
	legacyHeaders: false, 
});

router.post('/send-code', sendCodeLimiter, ErrorWrapper(AuthController.sendCode))

const verifyCodeLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: process.env.NODE_ENV === 'test' ? 100 : 5, // Higher limit for tests
	message: "Too many code verifications from this IP, please try again later.",
	standardHeaders: true,
	legacyHeaders: false,
});

router.post('/verify-code', verifyCodeLimiter, ErrorWrapper(AuthController.verifyCodeByEmail))

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: process.env.NODE_ENV === 'test' ? 100 : 10, // Higher limit for tests
	message: "Too many login attempts from this IP, please try again after 15 minutes.",
	standardHeaders: true,
	legacyHeaders: false,
});

router.post('/login', loginLimiter, ErrorWrapper(AuthController.login))

export default router

