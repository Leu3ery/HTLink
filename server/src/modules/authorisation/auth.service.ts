import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import { LoginDTO, SendCodeDTO, VerifyCodeDTO } from "./auth.dto";
import jwt from 'jsonwebtoken'
import { User } from "../users/users.model";
import { config } from "../../config/config";
import { Code } from "./codes.moddel";
import crypto from 'crypto';
import { EmailServiceFactory } from "./email/email.factory";
import bcrypt from 'bcrypt';


class AuthService {
	static async sendCode(dto: SendCodeDTO) {
		// Use cryptographically secure random number generator
		const code = crypto.randomInt(1000, 10000);
		const hashCode = crypto.createHash('sha256').update(code.toString()).digest('hex');
		
		// Invalidate old codes for this email
		await Code.deleteMany({ email: dto.email });
		
		await Code.create({ email: dto.email, hash_code: hashCode});
		await EmailServiceFactory.create().sendVerificationCode(dto.email, code.toString());
	}

	static async verifyCodeByEmail(dto: VerifyCodeDTO) {
		const hashCode = crypto.createHash('sha256').update(dto.code.toString()).digest('hex');
		const code = await Code.findOne({ email: dto.email, hash_code: hashCode });
		if (!code) throw new ErrorWithStatus(400, "Code not found");
		if (code.expires_at < new Date()) throw new ErrorWithStatus(400, "Code expired");
		if (code.attempts <= 0) throw new ErrorWithStatus(400, "Code attempts exceeded");
		code.attempts--;
		await code.save();
		const user = await User.findOne({ mail: dto.email });
		if (user) {
			return jwt.sign({ userId: user._id.toString() }, config.JWT_SECRET, { expiresIn: '14d' });
		} else {
			const newUser = new User();
			newUser.mail = dto.email;
			newUser.first_name = dto.email.split('.')[0] ?? null;
			newUser.last_name = dto.email.split('.')[1] ?? null;
			await newUser.save();
			return jwt.sign({ userId: newUser._id.toString() }, config.JWT_SECRET, { expiresIn: '14d' });
		}
	}

	static async login(dto: LoginDTO) {
		const user = await User.findOne({ mail: dto.mail });
		if (!user) throw new ErrorWithStatus(400, "User not found");
		if (!user.password) throw new ErrorWithStatus(400, "User has no password, please set a password first or login with email and code");
		const isPasswordValid = await bcrypt.compare(dto.password, user.password);
		if (!isPasswordValid) throw new ErrorWithStatus(400, "Invalid password");
		return jwt.sign({ userId: user._id.toString() }, config.JWT_SECRET, { expiresIn: '14d' });
	}

	// static async isUserValid(dto: LoginDTO) {
	// 	try {
	// 		const login = await LDAPService.login(dto.login, dto.password);
	// 		console.log(login)
	// 		if (login === 200) return true
	// 		return false
	// 	} catch (error) {
	// 		console.log(error)
	// 		return false
	// 	}
	// }

	// static async getUserInfo(dto: LoginDTO) {
	// 	try {
	// 		const userInfo = await LDAPService.getInfo(dto.login);
	// 		if (typeof userInfo === 'number' || !userInfo) {
	// 			throw new ErrorWithStatus(400, "User not found");
	// 		}
	// 		return userInfo;
	// 	} catch (error) {
	// 		console.log(error)
	// 		throw new ErrorWithStatus(400, "User not found");
	// 	}
	// }

	// static async login(dto: LoginDTO) {
	// 	const isUserValid = await this.isUserValid(dto);
	// 	if (!isUserValid) throw new ErrorWithStatus(400, "Login or password is false");
	// 	const userInfo = await this.getUserInfo(dto);

	// 	const user = await User.findOne({ pc_number: dto.login })
	// 	if (user) return jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '14d' })
		
	// 	const newuser = new User()
	// 	newuser.pc_number = dto.login

	// 	let userClass = null;
	// 	let role = null;
	// 	if (userInfo.description && /^\d/.test(userInfo.description.trim())) {
	// 		userClass = userInfo.description.trim();
	// 		role = "Student"
	// 	} else {
	// 		role = userInfo.description?.trim() || null
	// 	}


	// 	newuser.class = userClass
	// 	newuser.first_name = userInfo.givenName
	// 	newuser.last_name = userInfo.sn
	// 	newuser.role = role
	// 	// newuser.department = userInfo.department ? userInfo.department.split('-')[0] : undefined 
	// 	newuser.department = "IF"
	// 	newuser.mail = userInfo.mail
	// 	await newuser.save()

	// 	return jwt.sign({ userId: newuser._id }, config.JWT_SECRET, { expiresIn: '14d' })
	// }
}

export default AuthService

