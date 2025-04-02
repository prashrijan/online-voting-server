import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { conf } from "../conf/conf.js";

// user schema
const userScehma = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        address: {
            type: String,
        },
        email: {
            type: String,
            required: true,
        },
        dob: {
            type: Date,
        },
        password: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
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
userScehma.pre("save", async function (next) {
    if (!this.isModified("password") || this.password == null) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// check if password is correct
userScehma.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// generate access token
userScehma.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        conf.jwtSecret,
        {
            expiresIn: conf.jwtExpiry,
        }
    );
};
// generate refresh token
userScehma.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        conf.refreshSecret,
        {
            expiresIn: conf.refreshExpiry,
        }
    );
};

export const User = new mongoose.model("User", userScehma);
