import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import apiRoutes from "./routes/apiRoutes.js"; // Ensure the correct file path and extension
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Allow middleware requests from 'http://localhost:3000'
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api", apiRoutes);
