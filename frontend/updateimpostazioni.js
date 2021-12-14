function mandainfo()
{
    var url = "../api/impostazioni";
    var params = "animali="+document.getElementById('animali').checked;
    params += "&notturna="+document.getElementById('notturna').checked;
    if (document.getElementById('notturna').checked) {
        params += "&ore_inizio="+document.getElementById('ore_inizio').value;
        params += "&ore_fine="+document.getElementById('ore_fine').value;
    }
    params += "&gps="+document.getElementById('gps').checked;
    params += "&registrazione="+document.getElementById('registrazione').checked;
    // index of contatti goes from 1 to 4
    for (let i = 1; i <= 4; i++) {
        params += "&contatto"+String(i) + "="+document.getElementById('contatto'+String(i)).value;
    }


    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
}