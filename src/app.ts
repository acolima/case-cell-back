import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/productsRoutes.js";
import cartRouter from "./routes/cartRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", router);
app.use("/cart", cartRouter);

export default app;
