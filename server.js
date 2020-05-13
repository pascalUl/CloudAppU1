console.log("Server gestartet.")

const fs = require('fs')
const express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express()
var path = require("path");
var dir = "./static"
const dir2 = "./static/"

//Variables 
var initTitle = "Kein Titel vorhanden"
var initSubtitle = "Kein Subtitel vorhanden"
var initDate = "Kein Datum vorhanden"
var initStory = "Keine Story vorhanden"
var pathIma = ""
//Pic
var pictureName
var picFile
var id=0;
var number = 0
var maxNumber

/*** Start function ***/

//set ejs to frontend
app.set('view engine', 'ejs')

//start function 
app.get('/', (req, res) => {
  
  getData(number, function(){
    refresh(res)
  });
})


/*** AWS S3 - Upload ***/
//uploadFile('1589272971501-11874151.jpg');

// Load the SDK
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

// The name of the bucket that you have created
const BUCKET_NAME = 'cloudapp-media';

// S3 Client
var s3 = new AWS.S3( { params: {Bucket: BUCKET_NAME} } );

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


/*** AWS S3 - Download ***/ 
//getImage('1589272971501-11874151.jpg');

// Read image from S3
const getImage = (fileName) => {

  console.log("Filename: " + fileName)
  // Set Filename
  var file = path.basename(fileName)

  var getParams = {
    Bucket: BUCKET_NAME, 
    Key: file 
  }
  
  s3.getObject(getParams, function(err, data) {
    // Handle any error and exit
    if (err) return err

    picFile = "" + data.Body.toString('base64')
    console.log("File downloaded successfully.");
    });  
}


/*** Local file save ***/

//Init upload
const upload = multer({}).single('myImage')

//Static folder
app.use("/static", express.static('./static/'));

//Check if folder exists
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

//Def folder to save
var storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, dir)
  },
  //Def filename to save 
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    pictureName = uniqueSuffix + '.jpg'
    cb(null, pictureName)
  }
})

//Set framework to save file
var  uploadPic = multer ( {  storage : storage } )   


/*** MongoDB ***/

//Init connection to MongoDB
//mongodb+srv://<username>:<password>@cluster0-t4evc.mongodb.net/test?retryWrites=true&w=majority
const url = "mongodb+srv://dbUser:sudo@cluster0-t4evc.mongodb.net/test?retryWrites=true&w=majority";
//const url = "mongodb://localhost"
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  //Only test, if db is available
  console.log("DB läuft...")
  client.close();
});

//Insert data into db
  /*
  * DB: CloudAppDatabase
  * Collection: MediaFiles
  */
function insertPost(tit, sub, dat, sto){

  //get connection to db
  MongoClient.connect(url, function(err, db) {

    if (err) throw err;

    //set db
    var dbo = db.db("CloudAppDatabase");

    //create obj to insert into db
    var myobj = {id: id, title: tit, subtitle: sub, date: dat, image: pictureName, story: sto};  
    
    //get current number from button previous / next 
    id =id+1;
    
    //insert obj into db
    dbo.collection("MediaFiles").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("New post inserted");
        db.close();
      });   
  });  
}

//get data from db
function getData(i, callback){

  //get connection to db
  MongoClient.connect(url, function(err, db) {

    if (err) throw err;

    //set db
    var dbo = db.db("CloudAppDatabase");

    //get data and save into array
    dbo.collection("MediaFiles").find({}).toArray(function(err, result) {
      if (err) throw err;
      
      //get length from array to set maxNumer == Number of posts
      maxNumber = result.length-1

      //set data into fields if data is not undefined
      if(result[i] != null || result[i] != undefined){
        initTitle = result[i].title
        initSubtitle = result[i].subtitle
        initDate = result[i].date
        initStory = result[i].story
        initName = result[i].image
        //pathIma = dir2 + initName //MongoDB Version
        
        name = initName
        getImage(name)
	    }
      db.close();
    });
  });  
  
  //Call next function
  callback();
}

/*** Next / Previous Buttons ***/

//Call next post
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

//Call previous post
app.post('/zurueck', async function(req, res) {

  if(number === 0){
    number = maxNumber
  }
  else{
    number = number - 1
  }

  //ABFRAGE für DB
  getData(number, function(){
    refresh(res)
  })
})


/*** Set fields from site ***/

function refresh(res){
  res.render('index', {title: initTitle, subtitle: initSubtitle, date: initDate, story: initStory, path: "data:image/gif;base64," + picFile})// pathIma}) //<=MongoDB
}


/*** Button upload ***/

app.use(bodyParser.urlencoded({ extended: true })); 

app.post('/upload', uploadPic.single('myImage'),function (req, res){
    
  //Get data from fields
  var newTitle = `${req.body.iTitle}`;
  var newSubTitle = `${req.body.iSubtitle}`
  var date = new Date().toISOString()
  var newStory = `${req.body.iStory}`

  upload(req,res, (err) =>{
      if(err){
          res.send("Picture upload failed!")
      }
      else{
          //Insert post into db
          insertPost(newTitle, newSubTitle, date, newStory)
          res.send("Picture uploaded!")
      }
  });
  //Upload picture into S3
  uploadFile(dir + "/" + pictureName)
})

//App-port
app.listen(3000)