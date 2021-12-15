function mandainfo()
{
    var url = "../api/impostazioni";
    var params = "animali="+document.getElementById('animali').checked;
    params += "&notturna="+document.getElementById('notturna').checked;
    if (document.getElementById('notturna').checked) {
        params += "&ore_inizio="+document.getElementById('ore_inizio').value;
        params += "&ore_fine="+document.getElementById('ore_fine').value;
    }
    params += "&geolocalizzazione="+document.getElementById('gps').checked;
    params += "&registrazione="+document.getElementById('registrazione').checked;

    params += '&contatti={"0":"'+document.getElementById('contatto1').value + '"';
    // index of contatti goes from 1 to 4
    for (let i = 2; i <= 4; i++) {
        params += ', "'+String(i-1) + '":"'+document.getElementById('contatto'+String(i)).value +'"';
    }
    params += "}";
    console.log(params);


    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);

    // update contatti info when server responds
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            printData(document.cookie);    
        }
    }
    
}