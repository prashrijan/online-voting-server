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

        electionsParticipated: [
            {
                electionId: {
                    type: Schema.Types.ObjectId,
                    ref: "Election",
                },
                slogan: {
                    type: String,
                    default: "",
                },
                sloganStatus: {
                    type: String,
                    enum: ["Pending", "Approved", "Rejected"],
                },
                role: {
                    type: String,
                    enum: ["Admin", "User", "Candidate"],
                    default: "User",
                },
            },
        ],

        refreshToken: {
            type: String,
            default: "",
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        profileImage: {
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

// add elections participated to
userScehma.methods.addElection = function (electionId) {
    const alreadyParticipated = this.electionsParticipated.some((election) => {
        return election.electionId?.toString() == electionId.toString();
    });

    if (alreadyParticipated) return;

    this.electionsParticipated.push({
        electionId,
        slogan: "",
        sloganStatus: "Pending",
    });
};

// update role
userScehma.methods.updateRole = function (electionId, adminId) {
    const electionEntry = this.electionsParticipated.find((election) => {
        return election.electionId?.toString() == electionId.toString();
    });

    if (!electionEntry) {
        throw new Error("User has not paritcipated in this election");
    }

    if (String(this._id) == String(adminId)) {
        electionEntry.role = "Admin";
    } else {
        electionEntry.role = "Candidate";
    }
};

// users applies for slogan
userScehma.methods.requestSlogan = function (electionId, slogan) {
    const electionEntry = this.electionsParticipated.find((election) => {
        return election.electionId?.toString() == electionId.toString();
    });

    if (!electionEntry) {
        throw new Error("User has not paritcipated in this election");
    }

    electionEntry.slogan = slogan;
    electionEntry.sloganStatus = "Pending";
};

// admin approves or rejects a slogan
userScehma.methods.updateSloganStatus = function (electionId, status) {
    const electionEntry = this.electionsParticipated.find(
        (e) => e.electionId?.toString() === electionId.toString()
    );

    if (!electionEntry) {
        throw new Error("Election not found in user's participation.");
    }

    if (!["Approved", "Rejected"].includes(status)) {
        throw new Error("Invalid status. Must be 'Approved' or 'Rejected'.");
    }

    electionEntry.sloganStatus = status;
};
export const User = new mongoose.model("User", userScehma);
