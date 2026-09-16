import { Router } from "express";
import { ordersController } from "../controllers/ordersController.js";

const router = Router();

router.post("/checkout", ordersController.checkout);
router.post("/", ordersController.checkout);
router.get("/", ordersController.getOrders);

export default router;
