import { NextFunction, Request, Response } from "express";
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware";
import { validationWrapper } from "../../common/utils/utils.wrappers";
import { CreateOfferSchema, GetOffersSchema, UpdateOfferSchema } from "./offers.dto";
import mongoose from "mongoose";
import OffersService from "./offers.service";

class OffersController {
    static async createOffer(req: Request, res: Response, next: NextFunction) {
        const userId = res.locals.user.userId
		if (req.body.photo_path) throw new ErrorWithStatus(400, "photo_path is not allowed")
        const body = req.file ? {...req.body, photo_path: req.file.filename} : (req.body || {})
        if (body.skills !== undefined) {
            body.skills = Array.isArray(body.skills) ? body.skills : [body.skills];
        }
        const dto = validationWrapper(CreateOfferSchema, body)
        const offer = await OffersService.createOffer(userId, dto)
        res.status(201).json({ offer })
    }

    static async getOffers(req: Request, res: Response, next: NextFunction) {
        const query = { ...req.query };
        if (query.skills !== undefined) {
            query.skills = Array.isArray(query.skills) ? query.skills : [query.skills];
        }
        const dto = validationWrapper(GetOffersSchema, query || {})
        const offers = await OffersService.getOffers(dto)
        res.status(200).json({ offers })
    }

    static async getMyOffers(req: Request, res: Response, next: NextFunction) {
        const userId = res.locals.user.userId
        const offers = await OffersService.getMyOffers(userId)
        res.status(200).json({ offers })
    }

    static async updateOffer(req: Request, res: Response, next: NextFunction) {
        const userId = res.locals.user.userId
        const offerId = req.params.id
        if (!offerId) throw new ErrorWithStatus(400, "Offer ID is required")
        if (!mongoose.Types.ObjectId.isValid(offerId)) {
            throw new ErrorWithStatus(400, "Invalid offer id");
        }
		if (req.body.photo_path) throw new ErrorWithStatus(400, "photo_path is not allowed")
        const body = req.file ? {...req.body, photo_path: req.file.filename} : (req.body || {})
        if (body.skills !== undefined) {
            body.skills = Array.isArray(body.skills) ? body.skills : [body.skills];
        }
        const dto = validationWrapper(UpdateOfferSchema, body)
        const offer = await OffersService.updateOffer(userId, offerId, dto)
        res.status(200).json({ offer })
    }

    static async deleteOffer(req: Request, res: Response, next: NextFunction) {
        const userId = res.locals.user.userId
        const offerId = req.params.id
        if (!offerId) throw new ErrorWithStatus(400, "Offer ID is required")
        if (!mongoose.Types.ObjectId.isValid(offerId)) {
            throw new ErrorWithStatus(400, "Invalid offer id");
        }
        const offer = await OffersService.deleteOffer(userId, offerId)
        res.status(200).json({ offer })
    }
}

export default OffersController;