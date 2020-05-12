console.log("Server gestartet.")

// Load the SDK
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

// The name of the bucket that you have created
const BUCKET_NAME = 'cloudapp-media';

// S3 Client
var s3 = new AWS.S3( { params: {Bucket: BUCKET_NAME} } );

const fs = require('fs')
const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser');
const app = express()
var path = require("path");
var dir = "./static"
const dir2 = "./static/"
var name

// Save image to S3

const uploadFile = (fileName) => {
  // Read content from the file
  const fileContent = fs.readFileSync(fileName);

  // Set Filename
  var file = path.basename(fileName)


  // Setting up S3 upload parameters
  const params = {
      Bucket: BUCKET_NAME,
      Key: file, // File name you want to save as in S3
      Body: fileContent
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
      if (err) {
          throw err;
      }
      console.log(`File uploaded S3 successfully. ${data.Location}`);
  });
};

//uploadFile('1589272971501-11874151.jpg')

// Read image from S3
const getImage = (fileName) => {

  // Set Filename
  var file = path.basename(fileName)

  var getParams = {
    Bucket: BUCKET_NAME, 
    Key: file 
  }

  s3.getObject(getParams, function(err, data) {
    // Handle any error and exit
    if (err)
        return err;

        return objectData = data.Body.toString('utf-8'); // Use the encoding necessary
  
  });
}

//getImage('1589272971501-11874151.jpg');


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
console.log("In get data")

      if(result[i] != null || result[i] != undefined){
	console.log("in result" + result[i].title)

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
	uploadFile(dir + "/" + name)
})

 
app.listen(3000)


