import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/users.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS middleware before defining routes
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
  })
);

app.use(bodyParser.json());

app.use("/users", routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
