import express, { Request, Response } from "express";
import admin_router from "./routes/auth/admin";
import employee_registration_router from "./routes/registration/employee";
import employee_router from "./routes/auth/employee";
const PORT = process.env.PORT || 3000;
const app = express();

app.use("/api/auth/admin", admin_router);
app.use("/api/auth/employee", employee_router);
app.use("/api/employee/", employee_registration_router);
app.listen(PORT, () => console.log(`App is alive at http://localhost:${PORT}`));
