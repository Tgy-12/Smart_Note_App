require("dotenv").config();

const express = require('express');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const noteRoutes = require('./routes/noteRoutes');
const morganMiddleWare = require('./config/morganLogger');

const app = express();

app.use(morganMiddleWare);//before routing
app.use(express.json());//this middleware is used to parse incoming JSON requests and make the data available in req.body. It is essential for handling API requests that send data in JSON format.
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'Server is healthy...'
  })
})
app.use("/api/v1/notes", noteRoutes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
