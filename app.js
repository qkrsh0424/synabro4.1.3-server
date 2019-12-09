const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const session = require('./handler/sessionHandle');
const corsCheck = require('./config/corsCheck');
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

// app.use(function (req, res, next) { //1
//     console.log(req.headers.authorization);
//     console.log(corsCheck.checkAuth(req.headers.authorization));
//     // if(req.headers.authorization){
//         if(corsCheck.checkAuth(req.headers.authorization)){
//             next();
//         }else{
//             res.send(`<h1>not Found Page</h1>`);
//         }
//     // }
    
// });

const shbRoute = require(__dirname+'/api/routes/shbRoute');
const postRoute = require(__dirname+'/api/routes/postRoute');

const contactRoute = require(__dirname+'/api/routes/contactRoute');

//베너
const bannerRoute = require(__dirname+'/api/routes/bannerRoute');

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

//Utill
const mainSearchRoute = require(__dirname+'/api/routes/mainSearchRoute');

//admin and member
const adminRoute = require(__dirname+'/api/routes/adminRoute');
const memberRoute = require(__dirname+'/api/routes/memberRoute');

//render
const appItemsRender = require(__dirname+'/api/renders/appItems');


//API start
app.use('/api/shb',shbRoute);
app.use('/api/shb/post', postRoute);

app.use('/api/contact',contactRoute);

//베너
app.use('/api/banner',bannerRoute);

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

app.use('/api/auth/admin/',adminRoute);
app.use('/api/auth/member/',memberRoute);

app.use('/api/utill/mainSearch', mainSearchRoute);
//API end

//Render Start
app.use('/render/appItems', appItemsRender);
//Render End
app.get('/error',function(req,res){
    res.send(`<h1>notFound</h1>`);
})


// Deploy Setting
app.use(express.static(path.join(__dirname, "../client/build")));

app.get('/*',function(req,res){
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// app.use(express.static(path.join(__dirname, "../build")));

// app.get('/*',function(req,res){
//     res.sendFile(path.join(__dirname, "../build", "index.html"));
// });

app.listen(function(){
    console.log('app is running on server');
})

module.exports = app;