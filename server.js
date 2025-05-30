import dotenv from "dotenv";

// Load the correct env file based on NODE_ENV
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import electionRoutes from "./src/routes/election.route.js";
import chatbotRoutes from "./src/routes/chatbot.route.js";
import voteRoutes from "./src/routes/vote.route.js";
import paymentRoutes from "./src/routes/payment.route.js";
import { dbConnection } from "./src/db/dbConfig.js";

import passport from "./src/google-auth-app/config/passportConfig.js";
import session from "express-session";
import { conf } from "./src/conf/conf.js";
import { startCronJobs } from "./src/jobs/cron.js";
import { webHookRoute } from "./src/controllers/payment.controller.js";

const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [process.env.CLIENT_URL];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error(`${origin}: not allowed by CORS`));
            }
        },
        methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    })
);

app.use(
    "/api/v1/payment/webhook",
    express.raw({ type: "application/json" }),
    webHookRoute
);

app.use(express.json());

app.use(
    session({
        secret: conf.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// database connection
dbConnection()
    .then(() => console.log("Database connected to the server"))
    .catch((error) =>
        console.log(`Database server connection failed: ${error}`)
    );

// Start cron jobs
startCronJobs();

if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });
}

// auth routes
app.use("/api/v1/auth", authRoutes);

// user routes
app.use("/api/v1/user", userRoutes);

// election routes
app.use("/api/v1/election", electionRoutes);

// vote routes
app.use("/api/v1/vote", voteRoutes);

// chatbot routes
app.use("/api/v1/chat", chatbotRoutes);

// payment routes
app.use("/api/v1/payment", paymentRoutes);

app.listen(PORT, () => {
    console.log(`Server is ready on http://localhost:${PORT}`);
});
