import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("An Online Voting System");
});

app.listen(PORT, () => {
    console.log(`Server is ready on http://localhost:${PORT}`);
});
