async function fetchAsync (url) {
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    return data;
}

async function printData(acc)  { // change to dynamic
    let data = await fetchAsync('http://localhost:49146/api/notifica');
    console.log(data.length);
    let notifiche = document.getElementById('notifiche');
    console.log(notifiche.innerHTML);
    notifiche.innerHTML = ' ';
    for (let i = 0; i < data.length; i = i + 1) {
        let new_div = document.createElement('div');
        new_div.class = 'form-check';

        let new_input = document.createElement('input');
        new_input.classList.add('form-check-input'); 
        new_input.type = "checkbox";
        new_input.id = "notifica" + String(i+1);
        new_input.value = data[i].IDNot;
        if (data[i].confermata) {
            new_input.checked = true;
            new_input.disabled = true;
        }
        new_div.appendChild(new_input);

        let new_label = document.createElement('label');
        new_label.classList.add('form-check-label'); 
        new_label.for = 'notifica' + String(i);
        new_label.innerText = ' ' + data[i].testo + ' ' + data[i].datanot;
        new_label.style = 'margin-left: 10px'; // TODO: move this to CSS

        new_div.appendChild(new_label);
        notifiche.appendChild(new_div);
        
    }
    console.log(data);
}

printData(1);