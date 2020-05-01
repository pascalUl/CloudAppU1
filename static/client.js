console.log("Client-side code running");

var newTitle
var newSubtitle
var newStory
 
//After load site
function afterSiteLoad(){

  //ToDo: Daten von DB holen und auf Webseite setzen

  //Tassilos Code: noch nicht lauffähig...
  /*
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
  */

  document.getElementById("title").innerText = "Our last 15 days"
  document.getElementById("subtitle").innerText = "America-Tour"
  document.getElementById("image").src = "https://pix10.agoda.net/geo/city/318/1_318_02.jpg?s=1920x822"

  document.getElementById("date").innerText = "12.12.2019"
  document.getElementById("story").innerText = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."     
}

//Save new post
function getDataFromNewPost() {

  var titleLable = document.getElementById("newTitle")
  var subtitleLable = document.getElementById("newSubtitle")
  var storyLable = document.getElementById("newStory")

  newTitle = titleLable.value
  newSubtitle = subtitleLable.value
  newStory = storyLable.value

  console.log("Title: " + newTitle)
  console.log("Subtitle: " + newSubtitle)
  console.log("Story: " + newStory)

  titleLable.value = ""
  subtitleLable.value = ""
  storyLable.value = ""
  
}