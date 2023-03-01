import express from 'express';
import cors from 'cors';
import morgan from 'morgan'

import connect from './database/conn.js';
import router from './router/route.js';

const app = express();

app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody=buf.toString()
    },
    limit:'50mb'
}));
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); //less hackers know about our stack

const port = 8080;



app.get('/', (req, res) => {
    res.status(201).json("Home GET request")
})

/**api routes */
app.use('/api', router)
app.use(express.urlencoded({
    limit: "50mb",
    extended: true
}));


//Start server only with valid db connection

connect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server connected to http://localshost:${port}`
            );
        })
    } catch (error) {
        console.log('Cannot connect to the server')
        
    }
}).catch(error => {
    console.log('Invalid Databse connection')
})



