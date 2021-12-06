// Not sure how to set cookie correctly
function login() {
    console.log("Loginning");
    

    function load(url, callback) {
        var url = "./api/token";
        let user = document.getElementById('email').value;
        let pas = document.getElementById('pass').value;
        var params = "username="+String(user)+"&pass="+String(pas);
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            callback(xhr.response);
          }
        }
        
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(params);
    }
    
    
}
