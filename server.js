import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("An Online Voting System");
});

// auth routes
app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is ready on http://localhost:${PORT}`);
});
