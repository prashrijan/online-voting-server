import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// user schema
const userScehma = new Schema(
    {
        userName: {
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
