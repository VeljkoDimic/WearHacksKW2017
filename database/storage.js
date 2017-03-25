// var config = {
//    apiKey: "AIzaSyCVMbpAX0ocPFzff3hIoyoJ909w6CkFB_Q",
//    authDomain: "wearhackskw2017-51c15.firebaseapp.com",
//    databaseURL: "https://wearhackskw2017-51c15.firebaseio.com",
//    storageBucket: "wearhackskw2017-51c15.appspot.com",
//    messagingSenderId: "453839360783"
//  };
// firebase.initializeApp(config);
var Firebase = firebase.database().ref();
var patients = firebase.database().ref('patients');
var perscriptions = firebase.database().ref('perscriptions');
// var twilio = require('../texting/text')



function schedule(frequency, duration, time){
    var Schedule = {
        Frequency: frequency,
        Duration: duration, //default 24 hours (1/day)
        Start: 480  //Minutes
    }
    if (time){
        Schedule.Start = time;
    }
    else{
        Schedule.Start = 480;
        Schedule.Duration -= Math.ceil(frequency/2);    //Assume half the pills have been taken the day of
    }
    Schedule.Interval = Math.floor((24*60-Schedule.Start)/(frequency-1))* 60 * 1000;
    // Schedule.Interval = (24*60-Schedule.Start)/(frequency-1);

    // var s = Schedule.Start*60*1000;
    Schedule.Start = Schedule.Start*60*1000;
    var d = new Date();
    var epoch = d.getTime();
    if (!time){
        epoch += 86400000;
    }
    epoch= epoch - d.getMilliseconds() - d.getSeconds()*1000 - d.getMinutes()*60*1000 - d.getHours()*60*60*1000;
    Schedule.Start = Schedule.Start+epoch;   //In theory, sets time to Epoch time

    return Schedule;
}

//Returns the Epoch time of the time it is looking out for
function getEpochPerscription(perscription, callback){
    var time = perscription.Schedule.Start;
    var c = perscription.Count;
    var f = perscription.Schedule.Frequency;
    var i = perscription.Schedule.Interval;
    time = time + (Math.floor(c/f)*86400000) + i*(c%f);
    if (time){
        callback(time);
    }
    else{
        callback();
    }
}

function createPatient(id, name, number, age, method){
    patients.child(id).set({
        Name: name,
        Phone: number,
        Age: age,
        Method: method
    });
}

function createPerscription(id, name, detail, schedule){
    /* CHANGE PERSCRIPTIONID */
    perscriptions.push({
        PatientID: id,
        Name: name,
        Detail: detail,
        Schedule: schedule,
        Count: 0
    });
}

function getPhoneNumber(id, callback){
    patients.child(id + "/Phone/").once("value").then(function(snapshot){
        if (snapshot.val()){
            callback(snapshot.val());
        }
        else{
            callback();
        }
    });
}

function getPatientName(id, callback){
    patients.child(id + "/Name").once("value").then(function(snapshot){
        if (snapshot.val()){
            callback(snapshot.val());
        }
        else{
            callback();
        }
    });
}

function getPerscriptionName(id, callback){
    perscriptions.child(id + "/Name").once("value").then(function(snapshot){
        if (snapshot.val()){
            callback(snapshot.val());
        }
        else{
            callback();
        }
    });
}

function getPatient(id, callback){
    patients.child(id).once("value").then(function(snapshot){
        if (snapshot){
            callback(snapshot);
        }
        // if (snapshot.val()){
        //     callback(snapshot.val());
        // }
        // else{
        //     callback();
        // }
    });
}

function getPerscription(id, callback){
    perscriptions.child(id).once("value").then(function(snapshot){
        if (snapshot.val()){
            callback(snapshot.val());
        }
        else{
            callback();
        }
    });
}

function getAllPatients(callback){
    patients.once("value").then(function(snapshot){
        var i = 0;
        var pats = {};
        snapshot.forEach(function(childSnapshot){
            pats[i++] = childSnapshot.val();
        });
        callback(pats);
    });
}

function getAllPerscriptions(callback){
    perscriptions.once("value").then(function(snapshot){
        var i = 0;
        var pers = {};
        snapshot.forEach(function(childSnapshot){
            pers[i++] = childSnapshot.val();
        });
        callback(pers);
    });
}

function getAllPerscriptionsSnap(callback){
    perscriptions.once("value").then(function(snapshot){
      callback(snapshot);
    });
}

// module.exports = {
//   getAllPerscriptions:getAllPerscriptions,
//   getEpochPerscription:getEpochPerscription,
//   createPerscription:createPerscription,
//   schedule:schedule,
//   sendMessage: sendMessage,
//   getAllPerscriptionsSnap: getAllPerscriptionsSnap
// }


function getAllPatients2(callback){
  patients.once("value").then(function(snapshot){
    callback(snapshot);
  });
}


function sendMessage(perscription){
    var pat;
    getPatient(perscription.PatientID, function(d){
        pat = d;
        console.log("snap")
        console.log(pat.val())
        var message = "";
        console.log("COUNT::: " + perscription.Count);
        if (perscription.Count == 0){
            message += "This is your doctor's office here to remind you to take your " + perscription.Name + " " + perscription.Schedule.Frequency + " time(s) a day. \n" + perscription.Detail + "\nFor any further questions, please text or call 510-555-1837.\n";
        }
        message += "Hi " + pat.val().Name + "! It is time to take your " + perscription.Name + ".";
        getPhoneNumber(perscription.PatientID, function(number){
          console.log(number)
          console.log(message)
            if (pat.val().Method == 0){
                twilio.text(number, message);
            }
            else if (pat.val().Method == 1){
                twilio.call(number, message.replace(/ /g,"+"));
            }
            else if (pat.val().Method == 2){
                twilio.text(number, message);
                twilio.call(number, message.replace(/ /g,"+"));
            }
        });
    });
}
