const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const session = require('./handler/sessionHandle');

//bodyParser load
const bodyParser = require('body-parser');

//bodyParser setting
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session);

//cors options
// var whitelist = ['http://localhost:3000','/*']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions));
app.use(cors());

const shbRoute = require(__dirname+'/api/routes/shbRoute');

const contactRoute = require(__dirname+'/api/routes/contactRoute');


const univRoute = require(__dirname+'/api/routes/univRoute');
const univ_itemRoute = require(__dirname+'/api/routes/univ_itemRoute');
const univ_postRoute = require(__dirname+'/api/routes/univ_postRoute');
const beneRoute = require(__dirname+'/api/routes/beneRoute');
const upload_imgRoute = require(__dirname+'/api/routes/upload_imgRoute');
const post_likeRoute = require(__dirname+'/api/routes/post_likeRoute');
const commentRoute = require(__dirname+'/api/routes/commentRoute');

const signupRoute = require(__dirname+'/api/routes/signupRoute');
const loginRoute = require(__dirname+'/api/routes/loginRoute');
const logoutRoute = require(__dirname+'/api/routes/logoutRoute');
const auth_userRoute = require(__dirname+'/api/routes/auth_userRoute');
const get_userRoute = require(__dirname+'/api/routes/get_userRoute');
const profileRoute = require(__dirname+'/api/routes/profileRoute');

app.use('/api/shb',shbRoute);
app.use('/api/contact',contactRoute);

app.use('/api/univ',univRoute);
app.use('/api/univ_item',univ_itemRoute);
app.use('/api/univ_post',univ_postRoute);
app.use('/api/bene',beneRoute);
app.use('/api/uploadimg',upload_imgRoute);
app.use('/api/post_like', post_likeRoute);
app.use('/api/comment', commentRoute);

app.use('/api/auth/signup', signupRoute);
app.use('/api/auth/login',loginRoute);
app.use('/api/auth/logout',logoutRoute);
app.use('/api/auth/authentication',auth_userRoute);
app.use('/api/auth/getuser',get_userRoute);
app.use('/api/auth/profile',profileRoute);

// app.use(express.static(path.join(__dirname, "../client/build")));

// app.get('/*',function(req,res){
//     res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// });

app.listen(function(){
    console.log('app is running on server');
})

module.exports = app;