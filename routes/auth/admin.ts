import { Router } from "express";
import type { Request, Response } from "express";
import { json } from "express";
import { database, closeConnection } from "../../db/mongo";
import type { Admin } from "../../models/Admin";
import type { Collection } from "mongodb";
const admin_router = Router();

admin_router.use(json());

admin_router.post("/login", async (req: Request, res: Response) => {
    /*
        TODO:
        use hash validation instead of plaintext
        
    */
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Invalid request, please use your brain." });
    }

    const admins: Collection<Admin> = database.collection("admins");
    const admin_data = await admins
        .find({ email: email }, { projection: { _id: 0 } })
        .toArray();

    if (admin_data.length == 0) {
        return res.status(404).json({
            message:
                "No user is found with that email. Why look for someone that is non-existent?",
        });
    }
    // TODO:
    // use hash validation
    if (admin_data[0].password != password) {
        return res.status(401).json({
            message:
                "Did you perhaps forgot your password? Maybe you should stop watching p*rn?",
        });
    }
    // now the user passed all the test
    return res.status(200).json({ message: "Welcome to Sweet Home Alabama." });
});

export default admin_router;
