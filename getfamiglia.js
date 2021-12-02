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
    let data = await fetchAsync('http://localhost:49146/api/account'); // ?IDAcc=' + String(acc))
    let capo = data[0];
    document.getElementById('capo').innerText = capo.nome + ' ' + capo.cognome;
    console.log(data.length);
    for (let i = 1; i < data.length; i = i + 1) {
        let utente = document.getElementById('utente' + String(i));
        if (utente) {
            utente.innerText = data[i].nome + " " + data[i].cognome;
        } else { // TODO: createElement
            // prende tag di utenti dentro center
            let utenti = document.getElementById('utenti');
            utenti = utenti.getElementsByTagName('center')[0];
            console.log(utenti.innerHTML);
            // add new utente inside the tag utenti
            utenti.innerHTML += ('<hr> \n <p id="utente' + String(i) + '">' +
                data[i].nome + ' ' + data[i].cognome + '</p>');
        }
    }
    console.log(data);
}

printData(document.cookie);