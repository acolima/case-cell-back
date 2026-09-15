import express from "express";
import cors from "cors";
import router from "./routes/productsRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", router);

export default app;
