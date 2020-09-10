(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      //alert(JSON.stringify(smart));
      //alert(JSON.stringify(smart.user));
      if (smart.hasOwnProperty('patient')) {
        console.log(JSON.stringify(smart));
        var patient = smart.patient;
        var pt = patient.read();
        $.when(pt).fail(onError);

        $.when(pt).done(function(patient) {
            if (smart.hasOwnProperty('userId')) {
              //alert(smart.userId);
              //alert(smart.tokenResponse.access_token);
              var settings = {
                  "async": true,
                  "url": smart.userId,
                  "method": "GET",
                  "headers": {
                      "Content-Type": "application/json",
                      "Accept": "application/json",
                      "Authorization": "Bearer " + smart.tokenResponse.access_token
                  },
              }

              $.ajax(settings).done(function (response) {
                console.log("prationer ajax call ");
                console.log(response);
                //alert(JSON.stringify(response));
                if (typeof response.name[0] !== 'undefined') {
                  var lName = response.name[0].family;
                  patient.l5 = lName.substring(0, 5);
                }
                if (typeof response.identifier[0] !== 'undefined') {
                  //alert(response.identifier[0].value);
                  var sn = response.identifier[0].value;
                }
                //var lName = "Yellowstone"
                patient.dz = response.id;
                patient.sn = sn;
                //alert(JSON.stringify(patient));
                //alert(JSON.stringify(patient.resourceType));
                ret.resolve(patient);
              })
            } else {
              onError();
            }
        });
      } else {
              //alert("patient without context");
              //alert(smart.userId);
              //alert(smart.tokenResponse.access_token);
              var settings = {
                  "async": true,
                  "url": smart.userId,
                  "method": "GET",
                  "headers": {
                      "Content-Type": "application/json",
                      "Accept": "application/json",
                      "Authorization": "Bearer " + smart.tokenResponse.access_token
                  },
              }

              $.ajax(settings).done(function (response) {
                console.log("prationer ajax call ");
                console.log(response);
                //alert(JSON.stringify(response));
                var patient = {} ;
                if (typeof response.name[0] !== 'undefined') {
                  var lName = response.name[0].family;
                  if (lName != null) patient.l5 = lName.substring(0, 5);
                }
                if (typeof response.identifier[0] !== 'undefined') {
                  //alert(response.identifier[0].value);
                  var sn = response.identifier[0].value;
                }
                patient.dz = response.id;
                patient.sn = sn;
                patient.noContext = true;
                ret.resolve(patient);
              })   
        //onError();
      }
    }
    alert("version 15");
    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();
  };

  function getPractitioner(patient) {
      console.log(patient.userId);
      console.log(patient.tokenResponse.id_token);
      var settings = {
          "async": true,
          "url": patient.useId,
          "method": "GET",
          "headers": {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": "Bearer " + patient.tokenResponse.id_token
          },
      }

      $.ajax(settings).done(function (response) {
          console.log(response)
      })
  }

  function getPatientICN(patient) {
      const dsvIdentifierSystemName = 'urn:oid:2.16.840.1.113883.3.787.0.0';
      const dsvIcnIdentifierSystemName = 'urn:oid:2.16.840.1.113883.4.349'

      let patientId = 'getting';
      let found = false;

      console.log('extracting the patient identifier ICN');
      for(let i = 0; i < patient.identifier.length; i++) {
        if (patient.identifier[i].system === dsvIcnIdentifierSystemName) {
          patientId = patient.identifier[i].value;
          found = true;
          console.log(patientId);
          break;
        }
      }

      if(!found) {
        console.log('ICN not found.  extracting patient identifier MRN');
        for(let i = 0; i < patient.identifier.length; i++) {
          if (patient.identifier[i].system === dsvIdentifierSystemName) {
            patientId = patient.identifier[i].value;
            found = true;
            console.log(patientId);
            break;
          }
        }
      }

      if(!found) {
        console.log('Not patient identifier found');
      }

      return patientId;

  }

  window.redirectToRoes = function(patient) {
      //alert(JSON.stringify(patient));
      var dz = patient.dz;
      if (typeof patient.l5 !== 'undefined') var l5 = patient.l5.toUpperCase();;
      var sn = patient.sn;
      if (patient.noContext) {
        var roes_url = "https://vaww.dalctest.oamm.va.gov/scripts/mgwms32.dll?MGWLPN=ddcweb&wlapp=roes3home" + "&" + "DZ=" + dz + "&" + "L5=" + l5 + "&" + "SN=" + sn;
        if (sn == 'undefined' || sn == '' || dz == 'undefined' || dz == '' || l5 == 'undefined' || l5 == '') {
          var roes_url = "Not available";
        }
      }
      else {
        var icn = getPatientICN(patient);
        var fname = '';
        var lname = '';
        //alert(icn);
        if (typeof patient.name[0] !== 'undefined' ) {
          fname = patient.name[0].given;
          lname = patient.name[0].family;
        }
        var nm = lname + "," + fname;
        console.log(nm);

        var dobs = patient.birthDate.split("-");
        var dob = dobs[0]-1700 + dobs[1] + dobs[2];
        console.log(dob);
        if (typeof patient.address !== 'undefined' && patient.address != null) {
          var l1 = patient.address[0].line;
          var ci = patient.address[0].city;
          var st = "1^" + patient.address[0].state;
          var zp = patient.address[0].postalCode;
        }
        var roes_url = "https://vaww.dalctest.oamm.va.gov/scripts/mgwms32.dll?MGWLPN=ddcweb&wlapp=roes3patient" + "&"
      + "ICN=" + icn + "&" + "NM=" + nm + "&" + "DOB=" + dob + "&" + "L1=" + l1 + "&" + "CI=" + ci + "&" + "ST=" + st + "&"
      + "ZP=" + zp + "&" + "DZ=" + dz + "&" + "L5=" + l5 + "&" + "SN=" + sn;
        if (l1 == 'undefined' || l1 == '' || ci == 'undefined' || ci == '' || st == 'undefined' || st == '' || zp == 'undefined' || zp == '' 
        || dob == 'undefined' || dob == '' || icn == 'undefined' || icn == '' || sn == 'undefined' || sn == '' || dz == 'undefined' || dz == ''
        || l5 == 'undefined' || l5 == '') {
        var roes_url = "Not available";
        }
      }

      //alert(roes_url);
      if (roes_url !== "Not available") window.location.replace(roes_url);
  };

})(window);
