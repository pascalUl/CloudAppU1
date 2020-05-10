console.log("Server gestartet.")

const fs = require('fs')
const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser');
const app = express()

var dir = "./static"
const dir2 = "./static/"

if(!fs.existsSync(dir)){
  fs.mkdir(dir, function(err) {
    if (err) {
      console.log(err)
    } else {
      console.log("Directory images successfully created.")
    }
  })
}else{
  console.log("Directory images already exists.")
}

var name
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    name = uniqueSuffix + '.jpg'
    cb(null, name)
  }
})

var  uploadPic = multer ( {  storage : storage } )   
var id=0;

var initTitle = "A"
var initSubtitle = "B"
var initDate = "C"
var initStory = "D"
var pathIma = ""

var number = 0
var maxNumber

const MongoClient = require('mongodb').MongoClient;
//const url = "mongodb+srv://dbUser:sudo@cluster0-t4evc.mongodb.net/test?retryWrites=true&w=majority";
const url = "mongodb://localhost"
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
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
    var myobj = {id: id, title: tit, subtitle: sub, date: dat, image: name, story: sto};  
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

      if(result[i] != null || result[i] != undefined){

      initTitle = result[i].title
      initSubtitle = result[i].subtitle
      initDate = result[i].date
      initStory = result[i].story
      initName = result[i].image
      pathIma = dir2 + initName
	}

      db.close();
      callback()
    });
  });  
  
 callback();
 
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
  res.render('index', {title: initTitle, subtitle: initSubtitle, date: initDate, story: initStory, path: pathIma})
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

 
app.listen(3000)
