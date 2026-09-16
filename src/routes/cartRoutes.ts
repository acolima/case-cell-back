import { Router } from "express";
import { cartController } from "../controllers/cartController.js";

const router = Router();

router.get("/:clientId", cartController.getCart);
router.post("/", cartController.reserve);
router.patch("/", cartController.reserve);
router.delete("/:reservationId", cartController.cancel);

export default router;
