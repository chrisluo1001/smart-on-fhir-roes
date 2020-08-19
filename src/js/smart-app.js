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
          ret.resolve(patient);
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

  function getPatientICN(patient) {
      const dsvIdentifierSystemName = 'urn:oid:2.16.840.1.113883.3.787.0.0';
      const dsvIcnIdentifierSystemName = 'urn:oid:2.16.840.1.113883.3.42.10001.100001.12'
      //const dsvIcnIdentifierSystemName = 'urn:oid:2.16.840.1.113883.4.349';

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
      var dz = getPractitioner(patient);
      var icn = getPatientICN(patient);
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
      if (typeof patient.careProvider[0] !== 'undefined') {
        var userName = patient.careProvider[0].display;
      }
      var userLastName = userName.split(",")[0];
      var l5 = userLastName.substring(0, 5);
      
      console.log(l5);
      var sn = "668";
      var dz = "6729895";
      var l5 = "NALAM";
      //var ssn = "505335261";
      var ssn = "";
      var icn  = "1013180785V389525";

      var roes_url = "https://vaww.dalctest.oamm.va.gov/scripts/mgwms32.dll?MGWLPN=ddcweb&wlapp=roes3patient&" + "SSN=" + ssn + "&"
      + "ICN=" + icn + "&" + "NM=" + nm + "&" + "DOB=" + dob + "&" + "L1=" + l1 + "&" + "CI=" + ci + "&" + "ST=" + st + "&"
      + "ZP=" + zp + "&" + "DZ=" + dz + "&" + "L5=" + l5 + "&" + "SN=" + sn;

      console.log(roes_url);

      //window.location.replace(roes_url);
  };

})(window);
