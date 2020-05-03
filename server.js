console.log("Server gestartet.")

const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser');
const app = express()
var  uploadPic = multer ( {  dest : ' uploads / ' } )   
var url = "mongodb://localhost:27017/"; 
var id=0;

var initTitle = "A"
var initSubtitle = "B"
var initDate = "C"
var initStory = "D"

var number = 0
var maxNumber

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://dbUser:sudo@cluster0-t4evc.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(url, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  //Only test, if db is available
  console.log("DB läuft...")
  client.close();
});

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
function getData(i, callback){

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("CloudAppDatabase");
    dbo.collection("MediaFiles").find({}).toArray(function(err, result) {
      if (err) throw err;
 
      maxNumber = result.length-1
      initTitle = result[i].title
      initSubtitle = result[i].subtitle
      initDate = result[i].date
      initStory = result[i].story

      db.close();
      callback()
    });
  });  
 
}

//Init upload
const upload = multer({}).single('myImage')

//Static folder
app.use("/static", express.static('./static/'));

//Start page
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  //Start values
  console.log("NUMBER: " + number)
  getData(number,function(){
    refresh(res)
  });
  
  
})

function refresh(res){
  res.render('index', {title: initTitle, subtitle: initSubtitle, date: initDate, story: initStory})
}

//Set data into forms
app.post('/vor', async function(req, res) {
  if(number === maxNumber){
    number = 0
  }
  else{
    number = number + 1
  }
  console.log("NUMBER: " + number)
  //ABFRAGE für DB
  getData(number, function(){
    refresh(res)
  })
})

app.post('/zurueck', async function(req, res) {

  if(number === 0){
    number = maxNumber
  }
  else{
    number = number - 1
  }
  console.log("NUMBER: " + number)
  //ABFRAGE für DB
  getData(number, function(){
    refresh(res)
  })
})

app.use(bodyParser.urlencoded({ extended: true })); 
//Button Upload
app.post('/upload', uploadPic.single('myImage'),function (req, res){
    
    var newTitle = `${req.body.iTitle}`;
    var newSubTitle = `${req.body.iSubtitle}`
    var date = new Date().toISOString()
    var newStory = `${req.body.iStory}`
    
    var newImage = `${req.file}`

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