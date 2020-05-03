console.log("Server gestartet.")

const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser');
const app = express()
const MongoClient = require('mongodb').MongoClient;
var  uploadPic = multer ( {  dest : ' uploads / ' } )   
var url = "mongodb://localhost:27017/"; 
var id=0;


//MongoDB
  //DB: CloudAppDatabase
  //Collection: MediaFiles
function insertPost(tit, sub, dat, ima, sto){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("CloudAppDatabase");
    var myobj = {id: id, title: tit, subtitle: sub, date: dat, image: ima, story: sto};  
    id =id+1;
    dbo.collection("MediaFiles").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("New post inserted");
        db.close();
      });   
  });  
}

//MongoDB
function getData(){
  console.log("Methode getData() wurde aufgerufen.")
  //ToDo: Daten von DB holen und auf Webseite setzen
    MongoClient.connect(url, function(err, db) {
      
      if (err) throw err;
      var dbo = db.db("CloudAppDatabase");
  
      if (dbo.collection("MediaFiles").count(function (err, count){
        if(!err && count ===0){
          //if there are no pictures in db, then don't show title, image or subtitle on the homepage
          //Otherwise Start values

        }else{
          dbo.collection("MediaFiles").find({}).toArray( function(err, result) {
            var resultArray=[];
            if (err) throw err;
            console.log(result);
            myCursor = dbo.collection("MediaFiles").find( { id: 0 });
            console.log(myCursor.id);//kommt undefined raus
            
            
            /* Von Tassilos Versuchen
            var cursor = dbo.collection("MediaFiles").find({});
            //console.log(cursor);
            cursor.forEach( function(doc, err){
              if (err) throw err;
              resultArray.push(doc);
            });
            */
            
            //var json = JSON.parse(result)

            //return resultArray;        
          
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

  getData();
   
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
    var date = new Date().toISOString()
    var newStory = `${req.body.iStory}`
    
    var newImage = `${req.file}`

    console.log("DATA: " + newTitle + " " + newSubTitle + " " + newStory + " " + newImage.originalname )

    upload(req,res, (err) =>{
        if(err){
            res.send("Picture upload failed!")
        }
        else{
            //Insert post into db
            insertPost(newTitle, newSubTitle, date, newImage, newStory)
            res.send("Picture uploaded!")
        }
    });
})
 
app.listen(5000)