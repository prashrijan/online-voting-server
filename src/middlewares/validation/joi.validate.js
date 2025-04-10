import { ApiError } from "../../utils/customResponse/ApiError.js";

export const joiValidation = async (schema, req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        return res.status(400).json(new ApiError(400, error.message));
    }
};
