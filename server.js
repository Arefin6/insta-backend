const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

let pusher = require("pusher");
const  dbModel  = require("./dbModel.js");

//app Cofig
 const app = express();
 const port = process.env.PORT || 8080;

     pusher = new pusher({
    appId: "1118728",
    key: "b12d47ab6c6f1853fd04",
    secret: "e778d5f2b9198f646a9e",
    cluster: "mt1",
    useTLS: true
  });

//middleware
 app.use(express.json());
 app.use(cors());
//Db Connection
const connection =  `mongodb+srv://arefin6:01715250516arefin@cluster0.8pkoh.mongodb.net/instaDb?retryWrites=true&w=majority`;

mongoose.connect(connection,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
});
mongoose.connection.once('open',()=>{
    console.log("DB Connected");

    const changeStream = mongoose.connection.collection('posts').watch()

     changeStream.on('change',change=>{
        
        if(change.operationType === 'insert'){

            const postDetails = change.fullDocument;

            pusher.trigger('posts','inserted',{
                user:postDetails.user,
                caption:postDetails.caption,
                image:postDetails.image,
            });
        }
        else{
           console.log("Unknown triggerd"); 
        }

     });

})
//api routes
app.get('/',(req,res)=>{
   res.status(200).send('Hello World');
});
app.post('/upload',(req,res) =>{

    const body =req.body;

    dbModel.create(body,(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            res.status(200).send(data);
        }   

    });
});

app.get('/sync',(req,res)=>{
   
    dbModel.find((err,data)=>{
       
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(200).send(data);
        }   

    });

});

//Listen
app.listen(port);
