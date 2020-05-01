const express = require('express')
const multer = require('multer')
const path = require('path')
const app = express()
const MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/"; //ToDo: Falsche Adresse

//MongoDB
  //DB: CloudAppDatabase
  //Collection: MediaFiles
function insertPost(){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("CloudAppDatabase");
      var myobj = {title: "", subtitle: "", date: "", image: "", story: ""};  //ToDo: Daten noch übergeben
      dbo.collection("MediaFiles").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("New post inserted");
        db.close();
      });
    });  
  }

//Save image
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function( req, file, cb){
        cb(null,file.fieldname + "-" + Date.now() +
        path.extname(file.originalname))
    }
});

//Init upload
const upload = multer({
    storage:  storage
}).single('myImage')

console.log("Server gestartet.")

//Static folder
app.use("/static", express.static('./static/'));

app.get('/', (req, res) => {
    res.sendFile('C:/Users/pasi_/Desktop/HTWG/1.Semester/Cloud Application/CloudAppLesson/static/index.html')
})

//Button Upload
app.post('/upload', (req, res) =>{
    upload(req,res, (err) =>{
        if(err){
            res.send("Picture upload failed!")
        }
        else{
            console.log(req.file)
            res.send("Picture uploaded!")
            //Insert post into db
            insertPost()
        }
    });
})
 
app.listen(5000)