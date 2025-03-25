import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// user schema
const userScehma = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        dob: {
            type: Date,
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
        refreshToken: {
            type: String,
            default: "",
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

// check if password is correct
userScehma.methods.isPasswordCorrect = function (password) {
    return bcrypt.compare(password, this.password);
};

export const User = new mongoose.model("User", userScehma);
