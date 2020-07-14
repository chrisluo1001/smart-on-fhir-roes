(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        var obv = smart.patient.api.fetchAll({
                    type: 'Observation',
                    query: {
                      code: {
                        $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                              'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                              'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
                      }
                    }
                  });

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {

          var dz = getPractitioner(patient);

          //var byCodes = smart.byCodes(obv, 'code');
          //var gender = patient.gender;
          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }
          var nm = lname + "," + fname;
          console.log(nm);

          var dobs = patient.birthDate.split("-");
          var dob = dobs[0]-1700 + dobs[1] + dobs[2];
          console.log(dob);

          var l1 = patient.address[0].line;
          var ci = patient.address[0].city;
          var st = "1^" + patient.address[0].state;
          var zp = patient.address[0].postalCode;

          var l5 = lname.substring(0, 5);
          console.log(l5);
          var sn = "668";

          var ssn = "505438765";
          var icn  = "1013180785V389525";

          var roes_url = "https://vaww.dalctest.oamm.va.gov/scripts/mgwms32.dll?MGWLPN=ddcweb&wlapp=roes3patient&" + "SSN=" + ssn + "&"
          + "ICN=" + icn + "&" + "NM=" + nm + "&" + "DOB=" + dob + "&" + "L1=" + l1 + "&" + "CI=" + ci + "&" + "ST=" + st + "&"
          + "ZP=" + zp + "&" + "DZ=" + dz + "&" + "L5=" + l5 + "&" + "SN=" + sn;

          console.log(roes_url);

          //window.location.replace(roes_url);

          var height = byCodes('8302-2');
          var systolicbp = getBloodPressureValue(byCodes('55284-4'),'8480-6');
          var diastolicbp = getBloodPressureValue(byCodes('55284-4'),'8462-4');
          var hdl = byCodes('2085-9');
          var ldl = byCodes('2089-1');

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = getQuantityValueAndUnit(height[0]);

          if (typeof systolicbp != 'undefined')  {
            p.systolicbp = systolicbp;
          }

          if (typeof diastolicbp != 'undefined') {
            p.diastolicbp = diastolicbp;
          }

          p.hdl = getQuantityValueAndUnit(hdl[0]);
          p.ldl = getQuantityValueAndUnit(ldl[0]);

          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function getPractitioner(patient) {
    if (typeof patient.careProvider[0] !== 'undefined') {
      var pReference = patient.careProvider[0].reference;
    }
    var dz = pReference.split("/");
    console.log(dz[1]);
    return dz[1];
  }

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.redirectToRoes = function(patient) {
          var dz = getPractitioner(patient);

          //var byCodes = smart.byCodes(obv, 'code');
          //var gender = patient.gender;
          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }
          var nm = lname + "," + fname;
          console.log(nm);

          var dobs = patient.birthDate.split("-");
          var dob = dobs[0]-1700 + dobs[1] + dobs[2];
          console.log(dob);

          var l1 = patient.address[0].line;
          var ci = patient.address[0].city;
          var st = "1^" + patient.address[0].state;
          var zp = patient.address[0].postalCode;

          var l5 = lname.substring(0, 5);
          console.log(l5);
          var sn = "668";

          var ssn = "505438765";
          var icn  = "1013180785V389525";

          var roes_url = "https://vaww.dalctest.oamm.va.gov/scripts/mgwms32.dll?MGWLPN=ddcweb&wlapp=roes3patient&" + "SSN=" + ssn + "&"
          + "ICN=" + icn + "&" + "NM=" + nm + "&" + "DOB=" + dob + "&" + "L1=" + l1 + "&" + "CI=" + ci + "&" + "ST=" + st + "&"
          + "ZP=" + zp + "&" + "DZ=" + dz + "&" + "L5=" + l5 + "&" + "SN=" + sn;

          console.log(roes_url);

          window.location.replace(roes_url);
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);
