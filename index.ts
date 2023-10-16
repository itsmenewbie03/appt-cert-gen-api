import express, { Request, Response } from "express";
import admin_router from "./routes/auth/admin";

const PORT = process.env.PORT || 3000;
const app = express();

app.use("/api/admin", admin_router);
app.listen(PORT, () => console.log(`App is alive at http://localhost:${PORT}`));
