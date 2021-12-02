console.log('getfamiglia');

async function fetchAsync (url) {
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    return data;
}

async function printData(acc)  { // change to dynamic
    //console.log(acc.split('='));
    acc = acc.split('=')[1];
    let data = await fetchAsync('http://localhost:49146/api/impostazioni');
    console.log(data);
    
    if (data.animali)
        document.getElementById('animali').checked = true;
    if (data.notturna) {
        document.getElementById('notturna').checked = true;
        document.getElementById('ore_inizio').value = data.ore_inizio;
        document.getElementById('ore_fine').value = data.ore_fine;
    }
    if (data.geolocalizzazione) {
        document.getElementById('gps').click();
    }
    if (data.salvare) {
        document.getElementById('registrazione').click();
        // TODO: edit ore
    }
    let contatti = data.contatti;
    // index of contatti goes from 0 to max 3
    for (let i = 1; i <= 4; i++) {
        if (contatti[i-1]) {
            document.getElementById('contatto'+String(i)).value = contatti[i-1];
            console.log(contatti[i-1]);
        }
    }
    
}

printData(document.cookie);