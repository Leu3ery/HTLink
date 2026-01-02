import { Router } from "express";
import JWTMiddleware from "../../common/middlewares/JWTMiddleware";
import { ErrorWrapper } from "../../common/utils/utils.wrappers";
import OffersController from "./offers.controller";
import { upload } from "../../common/multer/multer.photo";
const router = Router();

router.post("/", JWTMiddleware, upload.single('photo_path'), ErrorWrapper(OffersController.createOffer))
router.get("/", JWTMiddleware, ErrorWrapper(OffersController.getOffers))
router.get("/my", JWTMiddleware, ErrorWrapper(OffersController.getMyOffers))
router.patch("/:id", JWTMiddleware, upload.single('photo_path'), ErrorWrapper(OffersController.updateOffer))
router.delete("/:id", JWTMiddleware, ErrorWrapper(OffersController.deleteOffer))

export default router;