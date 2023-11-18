require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const {logger,logEvents} = require('./middleware/logger');
const {handleError} = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;

// Logging a record, as every request to the system using custom niddleware
app.use(logger);

// 3rd party middleware
app.use(cookieParser());

// connect to mongdb
connectDB();

// 3rd party middleware
app.use(cors(corsOptions));

// Inform the server to refer static contents(CSS,Img,...)
app.use('/', express.static(path.join(__dirname,'public','css','style.css')));

app.use(express.json());

app.use('/', require('./routes/root'));

// auth routes
app.use('/auth', require('./routes/authRoutes'));

// user routes
app.use('/users', require('./routes/userRoutes'));

// Notes routes
app.use('/notes', require('./routes/noteRoutes'));

// provide these views as response for every unspecified routes
// Carefull to add this code chuck at the bottom of server file
app.all('*', (req,res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname,'views','404.html'));
    } else if(req.accepts('json')){
        res.json({message : 'Requested JSON data does not exist!'});
    } else{
        res.type('txt').send('404 Not Found!');
    }
});


// Error handling middlewrae
app.use(handleError);

// connect to the MongoDB & run the NODE app
mongoose.connection.once("open", () => {
  console.log('The system is coonected to MongoDb');
  app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
});

// If the connection with mongoDB has an error
mongoose.connection.on('error', err => {
    console.error(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrLog.log');
});
