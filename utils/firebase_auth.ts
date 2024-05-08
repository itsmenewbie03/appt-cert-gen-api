import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import credentials from "../credentials/service-account.json";

interface FirebaseVerifyTokenResult {
  email: string;
  uid: string;
}

initializeApp({
  // @ts-ignore
  credential: cert(credentials),
});

const verifyToken = async (
  id_token: string,
): Promise<FirebaseVerifyTokenResult | null> => {
  try {
    const decodedToken = await getAuth().verifyIdToken(id_token);
    console.log("Successfully verified token:", decodedToken);
    const uid = decodedToken.uid;
    return {
      uid: uid,
      // NOTE: i know this is shit but I don't have time xD
      email: decodedToken.email as string,
    };
  } catch (error) {
    return null;
  }
};

export { verifyToken as fireabase_verify_token };
