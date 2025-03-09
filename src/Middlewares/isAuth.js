import jwt from "jsonwebtoken";
import User from "../../DB/models/user-model.js";
import { systemRoles } from "../utils/system-roles.js";

export const isAuth = (roles=[systemRoles.USER]) => {
  return async (req, res, next) => {
    try {
      //get token
      const accesstoken = req.headers.accesstoken;

      if (!accesstoken) {
        console.log("test accesstoken");
        return next(new Error("Please sign in first"), { cause: 403 });
      }

      //check prefix
      if (!accesstoken.startsWith(process.env.TOKEN_PREFIX)) {
        console.log(process.env.TOKEN_PREFIX)
        return next(new Error("Invalid accesstoken prefix"), { cause: 400 });
      }

      //get payload
      const token = accesstoken.split(process.env.TOKEN_PREFIX)[1];
      const decodedData = jwt.verify(token, process.env.JWT_SECRET_LOGIN);
      if (!decodedData || !decodedData.id)
        return next(new Error("invalid token payload", { cause: 400 }));

      //check user

      const user = await User.findById(decodedData.id);
      if (!user) {
        return next(new Error("User not found"), { cause: 404 });
      }

      //check access

      if (!roles?.includes(user.role)) {
        return next(new Error("Unauthorized"), { cause: 401 });
      }

      //assign to req

      req.user = user;

      next();
    } catch (err) {
      console.log("Error from auth middleware", err);

      return next(new Error("Error from authuntication middleware"), {
        cause: 500,
      });
    }
  };
};
