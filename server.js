const express = require('express')
const multer = require('multer')
const path = require('path')
const app = express()

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
    res.sendFile('/home/pascal/CloudAppLesson/static/index.html')
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
        }
    });
})
 
app.listen(5000)