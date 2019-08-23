const express = require('express');
const app = express();

const session = require('./handler/sessionHandle');

//bodyParser load
const bodyParser = require('body-parser');

//bodyParser setting
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session);

const univRoute = require(__dirname+'/api/routes/univRoute');
const univ_itemRoute = require(__dirname+'/api/routes/univ_itemRoute');
const univ_postRoute = require(__dirname+'/api/routes/univ_postRoute');
const beneRoute = require(__dirname+'/api/routes/beneRoute');

const loginRoute = require(__dirname+'/api/routes/loginRoute');
const logoutRoute = require(__dirname+'/api/routes/logoutRoute');
const auth_userRoute = require(__dirname+'/api/routes/auth_userRoute');

app.use('/api/univ',univRoute);
app.use('/api/univ_item',univ_itemRoute);
app.use('/api/univ_post',univ_postRoute);
app.use('/api/bene',beneRoute);

app.use('/api/auth/login',loginRoute);
app.use('/api/auth/logout',logoutRoute);
app.use('/api/auth/authentication',auth_userRoute);

app.listen(function(){
    console.log('app is running on server');
})

module.exports = app;