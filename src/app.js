require("dotenv").config();
const env = require("./config/env");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoute");
const noteRoutes = require("./routes/noteRoutes");
const morganMiddleWare = require("./config/morganLogger");

const { globalLimiter } = require("./middlewares/rateLimiters");
const cors = require("cors");
const app = express();

app.use(morganMiddleWare); //before routing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Server is healthy...",
  });
});

app.use("/api/v1", globalLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", noteRoutes);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads", "avatars")),
);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
