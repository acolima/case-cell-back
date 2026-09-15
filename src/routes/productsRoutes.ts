import { Router } from "express";
import { productsController } from "../controllers/productsController.js";

const router = Router();

router.post("/", productsController.create);
router.get("/", productsController.get);

export default router;
