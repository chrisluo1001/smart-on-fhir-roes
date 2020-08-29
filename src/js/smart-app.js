(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      alert(smart.userId);
      alert(smart.tokenResponse.access_token);
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
          alert("practitioner ajax call ");
          console.log(response);
          alert(JSON.stringify(response));
          var dz = response.id;
          if (typeof response.name[0] !== 'undefined') {
            var lName = response.name[0].family;
            var l5 = lName.substring(0, 5);
          }
      })
      .fail(function(data) {
        if ( data.responseCode )
        console.log( data.responseCode );
      });
      
      if (smart.hasOwnProperty('patient')) {
        alert(JSON.stringify(smart));
        alert(JSON.stringify(smart.user));
        console.log(JSON.stringify(smart));
        var patient = smart.patient;
        var pt = patient.read();
        var user = smart.user;
        var us = user.read();
        $.when(pt).fail(onError);

        $.when(pt).done(function(patient) {
          ret.resolve(patient);
          patient.name = "chris";
          patient.last = "luo";
        });
        //         $.when(us).fail(onError);
//         $.when(us).done(function(user) {
//           ret.resolve(user);
//         });
      } else {
        alert("No patient exists");
        onError();
      }
    }
    alert('version 3');
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

  function getPatientICN(patient) {
      const dsvIdentifierSystemName = 'urn:oid:2.16.840.1.113883.3.787.0.0';
      const dsvIcnIdentifierSystemName = 'urn:oid:2.16.840.1.113883.4.349';

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
      alert(JSON.stringify(patient));
      console.log(JSON.stringify(patient));
      var icn = getPatientICN(patient);
      alert(icn);
      var fname = '';
      var lname = '';
      if (typeof patient.name[0] !== 'undefined') {
        fname = patient.name[0].given;
        lname = patient.name[0].family;
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
      
      console.log(l5);
      var sn = "668";
      var dz = "6729895";
      var l5 = "NALAM";

      var roes_url = "https://vaww.dalctest.oamm.va.gov/scripts/mgwms32.dll?MGWLPN=ddcweb&wlapp=roes3patient&" 
      + "ICN=" + icn + "&" + "NM=" + nm + "&" + "DOB=" + dob + "&" + "L1=" + l1 + "&" + "CI=" + ci + "&" + "ST=" + st + "&"
      + "ZP=" + zp + "&" + "DZ=" + dz + "&" + "L5=" + l5 + "&" + "SN=" + sn;

      console.log(roes_url);
      alert(roes_url);
      window.location.replace(roes_url);
  };

})(window);
