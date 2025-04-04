import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/customResponse/ApiError.js";
import jwt from "jsonwebtoken";
import { conf } from "../conf/conf.js";

/**
 * Middleware to authenticate a user based on a provided JWT token.
 * Validates the token against the database and decodes it to retrieve user information.
 * If authentication fails, an appropriate error response is sent.
 *
 * @async
 * @function authenticateuser
 * @param {Object} req - Express request object, containing the authorization token in headers.
 * @param {Object} res - Express response object, used to send error responses if authentication fails.
 * @param {Function} next - Express next middleware function, called if authentication succeeds.
 * @throws {ApiError} If the token is missing, invalid, expired, or if the user is not found.
 */

export const authenticateuser = async (req, res, next) => {
    try {
        const token = req.headers?.authorization;

        if (!token) {
            return res
                .status(404)
                .json(new ApiError(404, "Access Token is missing."));
        }

        // match the token in db
        const session = await Session.findOne({ token });

        if (!session) {
            return res
                .status(401)
                .json(
                    new ApiError(
                        401,
                        "This token is invalid or already expired. Please try again later"
                    )
                );
        }

        const tokenFromDb = session.token;

        if (token != tokenFromDb) {
            return res
                .status(403)
                .json(new ApiError(403, "Token mismatch. Access denied."));
        }

        const decoded = jwt.verify(tokenFromDb, conf.jwtSecret);

        if (!decoded) {
            return res
                .status(401)
                .json(
                    new ApiError(401, "Invalid token. Authentication failed.")
                );
        }

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found."));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(new ApiError(500, "Server error authenticating the user."));
    }
};
