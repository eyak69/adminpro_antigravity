import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./api/routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api", routes);

export default app;
