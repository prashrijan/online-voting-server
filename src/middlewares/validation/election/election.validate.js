import Joi from "joi";
import { joiValidation } from "../joi.validate.js";

export const electionValidatior = async (req, res, next) => {
    const electionSchema = Joi.object({
        title: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        candidates: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .allow(null)
            .default([]), // Validates ObjectId
        createdBy: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(), // Validates ObjectId})
    });

    await joiValidation(electionSchema, req, res, next);
};
