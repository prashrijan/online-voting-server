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
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["Admin", "User", "Candidate"],
            default: "User",
        },
        electionsParticipated: [
            {
                type: Schema.Types.ObjectId,
                ref: "Election",
            },
        ],
        slogan: {
            type: String,
            default: "",
        },
        refreshToken: {
            type: String,
            default: "",
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
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

// add elections participated to
userScehma.methods.addElection = function (electionId) {
    if (this.electionsParticipated.includes(electionId)) return;
    this.electionsParticipated.push(electionId);
};

// update role
userScehma.methods.updateRole = function (adminId) {
    if (String(this._id) == String(adminId)) {
        this.role = "Admin";
    } else {
        this.role = "Candidate";
    }
};
export const User = new mongoose.model("User", userScehma);
