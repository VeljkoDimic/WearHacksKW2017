$(document).ready(function(){
var db = require('../database/storage.js');
var a = 0;

var enterNewPrescription = function(modification){
  if(!modification){
    modification = "<h2>Add Prescription</h2>"
  }
  a++;
  var prescriptionHeader = ' <div id="prescription-container"> '+ modification + '   <input class="modal-subButton" id="btnRemovePrescription'+'" type="image" src="res/minus.png"/> <div class="prescription-section"> ';
  var prescriptionNameForm = '<form><label for="inputlg">Prescription Name</label> <input class="form-control input-lg" id="addNewPrescriptionName_' + a + '" type="text"/> </form>';
  var prescriptionDetailForm = '<form>      <label for="inputlg">Details</label>      <input class="form-control input-lg" id="addNewPrescriptionDetails_' + a + '" type="text"/>    </form>';
  var prescriptionFooter = ' </div> </div>';
  var textDosage = '<label for="inputlg">Dosage Schedule</label>    <label for="input-sm">Frequency (per day)</label>    <input class="form-control input-lg" id="addNewPrescriptionDosage_' + a + '"type="text"/>   ';
  textDosage += '   <label for="input-sm">Dosage Duration</label>    <input class="form-control input-lg" id="addNewPrescriptionDuration_' + a + '"type="text"/>   ';

  textDosage += '<label for="input-sm">Start time</label> <select class="hour input-lg" id="addNewPrescriptionStartTimeHour_'+ a + '" style="width: auto;">';
  for(var i = 0; i <= 9; i++){
    textDosage += "<option value=" + i + ">0" + i + "</option>";
  }
  for(var i = 10; i <=23; i++){
    textDosage += "<option value=" + i + ">" + i + "</option>";
  }
  textDosage += "</select>";
  textDosage += ":";
  textDosage += '<select class="minutes input-lg" id="addNewPrescriptionStartTimeMinute_'+ a + '"style="width: auto;">'
  for(var i = 0; i <= 9; i++){
    textDosage += "<option value=" + i + ">0" + i + "</option>";
  }
  for(var i = 10; i <=59; i++){
    textDosage += "<option value=" + i + ">" + i + "</option>";
  }
  textDosage += "</select>"
  textDosage += "</form>"

  return prescriptionHeader + prescriptionNameForm + prescriptionDetailForm + textDosage + prescriptionFooter;
  // $('#prescription-container').append(prescriptionHeader + prescriptionNameForm + prescriptionDetailForm + textDosage + prescriptionFooter);

};
var selectedPatientID;
var savePatient = function(){
  console.log("save");
  var name = document.getElementById('inputPatientName').value;
  var id = document.getElementById('inputPatientID').value;
  var phone = document.getElementById('inputPatientPhone').value;
  var age = document.getElementById('inputPatientAge').value;
  var method = document.getElementById('inputPatientMethod').value;
  db.createPatient(id, name, phone, age, method);
  selectedPatientID = id;
}

var savePrescription = function(){
 // for(var i = 0; i < a; i++){
    var prescriptionName = document.getElementById('addNewPrescriptionName_'+a).value;
    var prescriptionDetail = document.getElementById('addNewPrescriptionDetails_'+a).value;
    var prescriptionDosage = document.getElementById('addNewPrescriptionDosage_'+a).value;
    var prescriptionDuration = document.getElementById('addNewPrescriptionDuration_'+a).value;
    var selectedHour = document.getElementById('addNewPrescriptionStartTimeHour_'+a);
    var selectedHourValue = selectedHour.options[selectedHour.selectedIndex].value;
    var selectedMinute = document.getElementById('addNewPrescriptionStartTimeMinute_'+a);
    var selectedMinuteValue = selectedHour.options[selectedHour.selectedIndex].value;

    var minutes = parseInt(selectedHourValue) * 60 + parseInt(selectedMinuteValue);
    var pSchedule = db.schedule(prescriptionDosage, prescriptionDuration, minutes);
    db.createPerscription(selectedPatientID, prescriptionName, prescriptionDetail, pSchedule);
 // }
}
  $("#btnAddSubscription").on('click', function(){
    $('#prescription-container').append(enterNewPrescription());
  });

  $("#prescription-container").on('click', '#btnRemovePrescription', function(events) {
    $(this).closest('div').remove();
    console.log("removed");
    a--;
    console.log(a);
  });

  $("#existing-prescription-container").on('click', '#btnRemovePrescription', function(events) {
    $(this).closest('div').remove();
    console.log("removed");
    a--;
  });

  $('#btnAddSubscription-existing').on('click', function(){
    $('#existing-prescription-container').append(enterNewPrescription());
  });

  $("#btnSaveNewPatient").on('click', function(){
      savePatient()
      if(a>0){
          savePrescription()
      }
  });

  $('#btnSaveNewPrescription').on('click', function(){
    updateProfile()
    if(a>0){
      savePrescription()
    }
  });

  function updateProfile(){
    var updatedName = document.getElementById('existingPatientName').value;
    var updatedPhone = document.getElementById('existingPatientPhone').value;

    db.updateProfile(selectedPatientID, updatedName, updatedPhone)
    console.log('updated')
  }

  $('#aExistingPatientModal').on('click', function(events){
      console.log("showing patients");
      db.getAllPatients2(function(data){
        $('#existingPatientList').empty();
        data.forEach(function(child){
          console.log(child.key);
          var patientName = child.child("Name").val();
          var listItem = $('<li class="list-group-item" value="' + child.key + '"> </li>')
            .text(patientName);
          console.log(listItem);
          $('#existingPatientList').append(listItem);
        })})
    });

  $('#existingPatientList').on('click', 'li', function(events){
    // alert($(this).val());
    selectedPatientID = $(this).val();
    console.log("selected patient id: " + selectedPatientID);

    //update patient name

    db.getPatientName(selectedPatientID, function(data){
      console.log("patient name is retrieved as : " + data)
      $('#existingPatientName').val(data);
    });

    //update patient age
    db.getPhoneNumber(selectedPatientID, function(data){
      $('#existingPatientPhone').val(data);
    });

    //update patient phone number
    db.getPatient(selectedPatientID, function(data){
      $('#existingPatientAge').val(data.child('Age').val());
    });

    //update perscription list
    $('#prescriptionList').empty();
    db.getAllPerscriptionsSnap(function(data){
      data.forEach(function(childSnapshot){
        var id = childSnapshot.child('PatientID').val();
        if(selectedPatientID == id) {
          var name = childSnapshot.child('Name').val();
          var listItem = $('<li class="list-group-item" value="'+childSnapshot.key+'"></li>').text(name);
          $('#prescriptionList').append(listItem);
        }
      });
    });

  });

  $('#prescriptionList').on('click', 'li', function(events){
    $('#btnRemovePrescription').closest('div').remove();
    $('#existing-prescription-container').append(enterNewPrescription("<h2>Modify Prescription</h2>"));
    var prescriptionKey = $(this).attr('value');
    console.log(prescriptionKey);

    db.getPerscription(prescriptionKey, function(data){
      var name = data.child('Name').val()
      var details = data.child('Detail').val()
      var duration = data.child('Schedule').child('Duration').val()
      var frequency = data.child('Schedule').child('Frequency').val()

      console.log('addNewPrescriptionName_'+a)

      $('#addNewPrescriptionName_'+a).val(name)
      $('#addNewPrescriptionDetails_'+a).val(details)
      $('#addNewPrescriptionDosage_'+a).val(duration)
      $('#addNewPrescriptionDuration_'+a).val(frequency)

    })
  });
});
