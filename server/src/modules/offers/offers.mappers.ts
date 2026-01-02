import { ISkill } from "../skills/skills.model";
import { IUser } from "../users/users.model";
import { UserMapper } from "../users/users.mappers";

export type PopulatedOffer = {
    _id: any;
    id?: any;
    title: string;
    description: string;
    phoneNumber: string;
    price?: number;
    photo_path?: string;
    skills: ISkill[];
    ownerId: IUser;
    createdAt: Date;
    updatedAt: Date;
}

export class OffersMapper {
    static toPublicOffer(offer: PopulatedOffer) {
        return {
            id: (offer.id ?? offer._id).toString(),
            title: offer.title,
            description: offer.description,
            phoneNumber: offer.phoneNumber,
            price: offer.price,
            photo_path: offer.photo_path,
            skills: offer.skills.map((skill: ISkill) => ({id: skill._id.toString(), name: skill.name})),
            ownerId: UserMapper.toShortUser(offer.ownerId),
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt
        }
    }
}