console.log("Server gestartet.")

const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser');
const app = express()
const MongoClient = require('mongodb').MongoClient;
var  uploadPic = multer ( {  dest : ' uploads / ' } )   

var url = "mongodb://localhost:27017/"; //ToDo: Falsche Adresse

//MongoDB
  //DB: CloudAppDatabase
  //Collection: MediaFiles
function insertPost(tit, sub, dat, ima, sto){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("CloudAppDatabase");
    var myobj = {title: tit, subtitle: sub, date: dat, image: ima, story: sto};  
    dbo.collection("MediaFiles").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("New post inserted");
      db.close();
    });
  });  
}

//MongoDB
function getData(){
  //ToDo: Daten von DB holen und auf Webseite setzen
    MongoClient.connect(url, function(err, db) {
      
      if (err) throw err;
      var dbo = db.db("CloudAppDatabase");
  
      if (dbo.collection("MediaFiles").count(function (err, count){
        if(!err && count ===0){
          //if there are no pictures in db, then don't show title, image or subtitle on the homepage
        }else{
          dbo.collection("MediaFiles").findOne({}, function(err, result) {
            if (err) throw err;
            
            var json = JSON.parse(result)
            document.getElementById("title").innerText = json.title
            document.getElementById("subtitle").innerText = json.subtitle
            document.getElementById("image").src = json.source
          
            document.getElementById("date").innerText = json.date
            document.getElementById("story").innerText = json.story
  
            db.close();
          
        });
      }
    }));
  })
}

//Init upload
const upload = multer({}).single('myImage')

//Static folder
app.use("/static", express.static('./static/'));

//Start values
var initTitle = "A"
var initSubtitle = "B"
var initDate = "C"
var initStory = "D"

app.set('view engine', 'ejs')
app.get('/', (req, res) => {
    res.render('index', {title: initTitle, subtitle: initSubtitle, date: initDate, story: initStory})
})

//Set data to forms
app.post('/vor', function(req, res) {

  //ABFRAGE für DB

  initTitle = "Nächster Title"
  initSubtitle = "Nächster Subtitle"
  initDate = "Nächstes Datum"
  initStory = "Nächste Story"
  res.render('index', {title: initTitle, subtitle: initSubtitle, date: initDate, story: initStory})
})

app.post('/zurueck', function(req, res) {

  //ABFRAGE für DB

  initTitle = "Vorheriger Title"
  initSubtitle = "Vorheriger  Subtitle"
  initDate = "Vorheriges Datum"
  initStory = "Vorherige Story"
  res.render('index', {title: initTitle, subtitle: initSubtitle, date: initDate, story: initStory})
})

app.use(bodyParser.urlencoded({ extended: true })); 
//Button Upload
app.post('/upload', uploadPic.single('myImage'),function (req, res){
    
    var newTitle = `${req.body.iTitle}`;
    var newSubTitle = `${req.body.iSubtitle}`
    var date = new Date()
    var newDate = date.getHours() + ":" + date.getMinutes()
    var newStory = `${req.body.iStory}`
    
    var newImage = `${req.file}`

    console.log("DATA: " + newTitle + "" + newSubTitle + "" + newStory + "" + newImage.originalname )

    upload(req,res, (err) =>{
        if(err){
            res.send("Picture upload failed!")
        }
        else{
            //Insert post into db
            insertPost(newTitle, newSubTitle, newDate, newImage, newStory)
            res.send("Picture uploaded!")
        }
    });
})
 
app.listen(5000)