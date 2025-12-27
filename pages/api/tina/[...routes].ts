import { TinaNodeBackend, LocalBackendAuthProvider } from "@tinacms/datalayer";
import database from "../../../tina/database";

const handler = TinaNodeBackend({
  authProvider: process.env.NODE_ENV === "development" 
    ? LocalBackendAuthProvider() 
    : {
        isAuthorized: async (req: any) => {
          if (process.env.NODE_ENV === "development") {
            return { isAuthorized: true };
          }
          // Simple token-based auth for self-hosting
          // You can also implement a real login system here
          const authHeader = req.headers["authorization"];
          if (authHeader === `Bearer ${process.env.TINA_TOKEN}`) {
            return { isAuthorized: true };
          }
          return { isAuthorized: false };
        }
      },
  databaseClient: database,
});

export default (req: any, res: any) => {
  return handler(req, res);
};

