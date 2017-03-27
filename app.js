var express = require('express')
var app = express()
app.use(express.static('./'))
var db = require('./database/storage')

function notify() {
  console.log("from notify")
  db.getAllPerscriptionsSnap((res)=>{
    // if(err){
    //   console.log('err')
    //   console.log(err)
    // }else {
      var ps = res.val()
      console.log(ps)
      for(var perscription in ps) {
        console.log(perscription)
        db.getEpochPerscription(ps[perscription],(pTime)=>{
          console.log((new Date().getTime() - pTime))
          // if(err){
          //   console.log(err)
          // }else{
            if((new Date().getTime() >= pTime)){
              db.sendMessage(ps[perscription], perscription);
            }
          // }
        })
      }
    // }
  })
}

var d = new Date();
//db.createPerscription(1414,"Meth","Blue",db.schedule(720,7,d.getHours()*60+d.getMinutes()+1));


var minutes = 0.1, the_interval = minutes * 60 * 1000;
setInterval(function() {
  console.log("I am doing my 5 minutes check");
  notify()
  // do your stuff here
}, the_interval);

app.get('/', function (req, res) {
  res.sendFile('index.html', {root: './' })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
