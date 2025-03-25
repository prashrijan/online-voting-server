import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// user schema
const userScehma = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Inactive",
        },
        role: {
            type: String,
            enum: ["Admin", "User"],
            default: "User",
        },
    },
    { timestamps: true }
);

// hash password before saving it to the database
userScehma.pre("save", function (next) {
    if (!this.isModified(this.password)) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
});

export const User = new mongoose.model("User", userScehma);
