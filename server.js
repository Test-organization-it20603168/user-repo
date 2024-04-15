const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();
dotenv.config();
connectDB();

app.use(express.json());

app.get("/app", (req, res) => {
  res.send("API is running");
});

app.use("/", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5002;

app.listen(PORT, console.log(`Server Started on port ${PORT}..`));
