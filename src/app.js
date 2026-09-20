require("dotenv").config();

const path = require('path');
const express = require('express');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoute');
const noteRoutes = require('./routes/noteRoutes');
const morganMiddleWare = require('./config/morganLogger');
const cors = require('cors');
const app = express();

app.use(morganMiddleWare);//before routing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
   origin: "http://localhost:5173",
  // methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'Server is healthy...'
  });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", noteRoutes);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'avatars')));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
