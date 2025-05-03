import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import electionRoutes from "./src/routes/election.route.js";
import chatbotRoutes from "./src/routes/chatbot.route.js";
import voteRoutes from "./src/routes/vote.route.js";
import { dbConnection } from "./src/db/dbConfig.js";
import { rateLimit } from "express-rate-limit";
import passport from "./src/google-auth-app/config/passportConfig.js";
import session from "express-session";
import { conf } from "./src/conf/conf.js";
import { startCronJobs } from "./src/jobs/cron.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
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

// rate limit
const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    message: "Too many requests from this IP. Please try again later",
});

// app.use(limiter);

// Start cron jobs
startCronJobs();

app.get("/", (req, res) => {
    res.send("An Online Voting System");
});

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

app.listen(PORT, () => {
    console.log(`Server is ready on http://localhost:${PORT}`);
});
