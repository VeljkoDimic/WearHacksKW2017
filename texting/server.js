var db = require('../database/storage')

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
              db.sendMessage(ps[perscription])
            }
          // }
        })
      }
    // }
  })
}

var minutes = 0.1, the_interval = minutes * 60 * 1000;
setInterval(function() {
  console.log("I am doing my 5 minutes check");
  notify()
  // do your stuff here
}, the_interval);
