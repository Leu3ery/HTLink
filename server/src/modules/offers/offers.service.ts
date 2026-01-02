import mongoose from "mongoose"
import { ErrorWithStatus } from "../../common/middlewares/errorHandlerMiddleware"
import { Skill } from "../skills/skills.model"
import { User } from "../users/users.model"
import { CreateOfferDTO, GetOffersDTO, UpdateOfferDTO } from "./offers.dto"
import { OffersMapper, PopulatedOffer } from "./offers.mappers"
import { Offer } from "./offers.model"
import deleteFile from "../../common/utils/utils.deleteFile"

class OffersService {
    static async createOffer(userId: string, dto: CreateOfferDTO) {
        const skills = await Skill.find({ _id: { $in: dto.skills } })
        if (skills.length !== dto.skills.length) throw new ErrorWithStatus(400, "Skill not found")
        const offer = await Offer.create({
            ...dto,
            ownerId: userId,
        })
        const populatedOffer = await Offer.findById(offer._id).populate('skills').populate('ownerId')
        if (!populatedOffer) throw new ErrorWithStatus(404, "Offer not found")
        return OffersMapper.toPublicOffer(populatedOffer as unknown as PopulatedOffer)

    }

    static async getOffers(dto: GetOffersDTO) {
        const filter: Record<string, unknown> = {}
        if (dto.title) filter.title = { $regex: dto.title, $options: 'i' }
        if (dto.skills && dto.skills.length > 0) {
            filter.skills = { $in: dto.skills }
        }
        const offers = await Offer.find(filter).populate('skills').populate('ownerId').sort({ createdAt: -1 }).skip(dto.offset).limit(dto.limit)
        return offers.map(offer => OffersMapper.toPublicOffer(offer as unknown as PopulatedOffer))
    }

    static async getMyOffers(userId: string) {
        const offers = await Offer.find({ ownerId: userId }).populate('skills').populate('ownerId').sort({ createdAt: -1 })
        return offers.map(offer => OffersMapper.toPublicOffer(offer as unknown as PopulatedOffer))
    }

    static async updateOffer(userId: string, offerId: string, dto: UpdateOfferDTO) {
        if (!mongoose.Types.ObjectId.isValid(offerId)) throw new ErrorWithStatus(400, "Invalid offer id")
        const offer = await Offer.findById(offerId)
        if (!offer) throw new ErrorWithStatus(404, "Offer not found")
        if (offer.ownerId.toString() !== userId) throw new ErrorWithStatus(403, "Forbidden")
        const skills = await Skill.find({ _id: { $in: dto.skills } })
        if (skills.length !== dto.skills.length) throw new ErrorWithStatus(400, "Skill not found")
        const oldPhotoPath = offer.photo_path
        offer.set(dto)
        await offer.save()
        if (dto.photo_path && oldPhotoPath && oldPhotoPath !== dto.photo_path) {
            await deleteFile(oldPhotoPath)
        }
        const populatedOffer = await Offer.findById(offer._id).populate('skills').populate('ownerId')
        if (!populatedOffer) throw new ErrorWithStatus(404, "Offer not found")
        return OffersMapper.toPublicOffer(populatedOffer as unknown as PopulatedOffer)
    }

    static async deleteOffer(userId: string, offerId: string) {
        if (!mongoose.Types.ObjectId.isValid(offerId)) throw new ErrorWithStatus(400, "Invalid offer id")
        const offer = await Offer.findById(offerId)
        if (!offer) throw new ErrorWithStatus(404, "Offer not found")
        if (offer.ownerId.toString() !== userId) throw new ErrorWithStatus(403, "Forbidden")
        if (offer.photo_path) {
            await deleteFile(offer.photo_path)
        }
        await offer.deleteOne()
        return OffersMapper.toPublicOffer(offer as unknown as PopulatedOffer)
    }
}

export default OffersService