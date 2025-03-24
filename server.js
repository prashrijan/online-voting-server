import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import { dbConnection } from "./src/db/dbConfig.js";
import { rateLimit } from "express-rate-limit";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

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

app.use(limiter);

app.get("/", (req, res) => {
    res.send("An Online Voting System");
});

// auth routes
app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is ready on http://localhost:${PORT}`);
});
