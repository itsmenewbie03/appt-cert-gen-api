import express from "express";
import cors from "cors";
import admin_router from "./routes/auth/admin";
import employee_registration_router from "./routes/registration/employee";
import employee_router from "./routes/auth/employee";
import session_router from "./routes/auth/session";
import google_oauth_router from "./routes/auth/google_oauth";
import employee_accounts_router from "./routes/accounts/employee";
import resident_router from "./routes/data/resident";
import user_router from "./routes/auth/user";
import document_router from "./routes/documents/document";
import transaction_router from "./routes/transactions/transaction";
import user_registration_router from "./routes/registration/user";
import pending_user_router from "./routes/registration/pending_user";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use("/api/auth/admin", admin_router);
app.use("/api/auth/employee", employee_router);
app.use("/api/auth/session", session_router);
app.use("/api/auth/user", user_router);
app.use("/api/oauth/google", google_oauth_router);
app.use("/api/employee", employee_registration_router);
app.use("/api/accounts/employees", employee_accounts_router);
app.use("/api/data/resident", resident_router);
app.use("/api/documents", document_router);
app.use("/api/transactions", transaction_router);
app.use("/api/user", user_registration_router);
app.use("/api/user/pending", pending_user_router);

app.listen(PORT, () => console.log(`App is alive at http://localhost:${PORT}`));
