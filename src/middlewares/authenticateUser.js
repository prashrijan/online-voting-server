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

/**
 * Middleware to authenticate a user based on a provided refresh token.
 * Validates the refresh token against the database and decodes it to retrieve user information.
 * Ensures the refresh token matches the one stored for the user in the database.
 * If authentication fails, an appropriate error response is sent.
 *
 * @async
 * @function refreshAuthenticate
 * @param {Object} req - Express request object, containing the refresh token in headers.
 * @param {Object} res - Express response object, used to send error responses if authentication fails.
 * @param {Function} next - Express next middleware function, called if authentication succeeds.
 * @throws {ApiError} If the refresh token is missing, invalid, mismatched, or if the user is not found.
 */

export const refreshAuthenticate = async (req, res, next) => {
    try {
        const refreshToken = req.headers?.authorization;

        if (!refreshToken) {
            return res
                .status(404)
                .json(new ApiError(404, "Refresh token is missing."));
        }

        const decoded = jwt.verify(refreshToken, conf.refreshSecret);

        if (!decoded.email) {
            return res
                .status(401)
                .json(
                    new ApiError(
                        401,
                        "Invalid refresh token. Authentication failed."
                    )
                );
        }

        const user = await User.findOne({ email: decoded.email });

        if (refreshToken !== user.refreshToken) {
            return res
                .status(403)
                .json(
                    new ApiError(403, "Refresh token mismatch. Access denied.")
                );
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error authenticating the token.")
        );
    }
};

/**
 * Middleware to verify if the authenticated user has admin privileges.
 * Checks the user's role and allows access to the next middleware if the user is an admin.
 * If the user is not an admin or not authenticated, an appropriate error response is sent.
 *
 * @async
 * @function isAdmin
 * @param {Object} req - Express request object, containing the authenticated user in `req.user`.
 * @param {Object} res - Express response object, used to send error responses if authorization fails.
 * @param {Function} next - Express next middleware function, called if the user has admin privileges.
 * @throws {ApiError} If the user is not found, does not have admin privileges, or if a server error occurs.
 */

export const isAdmin = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found."));
        }

        if (user.role == "Admin") {
            next();
        } else {
            return res
                .status(403)
                .json(
                    new ApiError(
                        403,
                        "Access denied. Admin privileges required."
                    )
                );
        }
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error authenticating user as admin.")
        );
    }
};

/**
 * Middleware to verify if the authenticated user has candidate privileges.
 * Checks the user's role and allows access to the next middleware if the user is a candidate.
 * If the user is not a candidate or not authenticated, an appropriate error response is sent.
 *
 * @async
 * @function isCandidate
 * @param {Object} req - Express request object, containing the authenticated user in `req.user`.
 * @param {Object} res - Express response object, used to send error responses if authorization fails.
 * @param {Function} next - Express next middleware function, called if the user has candidate privileges.
 * @throws {ApiError} If the user is not found, does not have candidate privileges, or if a server error occurs.
 */

export const isCandidate = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found."));
        }

        if (user.role == "Candidate") {
            next();
        } else {
            return res
                .status(403)
                .json(
                    new ApiError(
                        403,
                        "Access denied. Candidate privileges required."
                    )
                );
        }
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error authenticating user as admin.")
        );
    }
};
