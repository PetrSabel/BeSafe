const Express = require("express"); //import
const BodyParser = require("body-parser");
const mysql = require('mysql');
//const url = require('url');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookie = require('cookie-parser'); // TODO: check if needed
const fs = require('fs');

// TODOS: buttons of index.html; button invite to famiglia.html; ore registrazione in info.html
//        


// get secret token from .env file
dotenv.config();

// generate token during login
function generateAccessToken(username, acc) {
  let data = jwt.sign({IDUser: username, IDAcc: acc}, process.env.TOKEN_SECRET, { expiresIn: "1800s" });
  return data;
}

// check session token taken from cookies
//  if token is valid, set its data as request attributes
function authenticateToken(req, res, next) {
  //get token from request's cookies
  let token = req.cookies.Authorization;
  console.log('Authenticate');
  console.log(token);
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, String(process.env.TOKEN_SECRET), (err, data) => {
    console.log(err)
    // if token is invalid, then respondes 'forbidden'
    if (err) return res.sendStatus(403);

    // if token is valid, set its data as request attributes
    req.user = data.IDUser;
    req.acc = data.IDAcc;
    
    // jump to request evaluation function
    next()
  })
}

// connect to local mysql DB
var database = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "BeSafeDB"
});
database.connect(function(err) {
  if (err) {
    console.log('FAIL to connect');
    throw err;
    return;
  } else {
    console.log("Connected!");
  }
});

var app = Express(); // create and configure
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended:true }));
app.use(cors());
app.use(cookie()); // TODO: above

app.listen(49146, () => { }); // connect to socket/port

// example impostazioni
var data = {'animali': true, 'notturna': true, "ore_inizio": "23:00", "ore_fine": "5:00",
   "gps": true, "casa": 0x325325, "tempo_quanto": "72:00", "contatti": {
       1: "+39253525",
       2: "+373828238",
       3: "+235535"
   }};


// control that acc is int (can be negative)
function checkAcc (acc) {
  console.log(acc);
  acc = Number(acc);
  if (!Number.isInteger(acc)) {
    return undefined;
  } else {
    return acc;
  }
}

// take query to execute. If error, respond 400, else call function callback
//  passing as argument the result of query in JSON
function querySql (q, response, callback) {
  database.query(q, function (err, result, fields) {
    if (err) {
      response.status(400).send('DB error');
      throw err;
    } else {
      if (result[0]) {
        callback(result);
      } else {
        console.log('Not in DB');
        response.status(404).send('Not found in DB');
      }
    }
  });
}

// read HTML file and send it in response
function respondHtml (name, type, res) {
  fs.readFile(name, function(err,data){
    if (!err) {
        res.writeHead(200, {'Content-Type': type}); // delete type???
        res.write(data);
        res.end();
    } else {
        console.log(err);
        res.status(400).send('HTML error');
    }
  });
}

// PAGES

// should make better

app.get('/*.html', (request, response) => {
  respondHtml(request.params[0] + '.html', 'text/html', response);
});

app.get('/*.js', (request, response) => {
  respondHtml(request.params[0] + '.js', 'script', response);
});

app.get('/*.css', (request, response) => {
  respondHtml(request.params[0] + '.css', 'stylesheet', response);
});

app.get('/img/*', (request, response) => {
  respondHtml('./img/' + request.params[0], 'image/png', response);
});

/*
app.get('/notifiche.html', (request, response) => {
  respondHtml('notifiche.html', response);
});

app.get('/famiglia.html', (request, response) => {
  respondHtml('famiglia.html', response);
});

app.get('/index.html', (request, response) => {
  respondHtml('index.html', response);
});

app.get('/info.html', (request, response) => {
  respondHtml('info.html', response);
});

app.get('/registrazione.html', (request, response) => {
  respondHtml('registrazione.html', response);
});

app.get('/registrazioni.html', (request, response) => {
  respondHtml('registrazioni.html', response);
});*/



// API
app.get('/api/temptoken', (req, res) => {
  let token = generateAccessToken('petr', 1);
  res.cookie('Authorization', token, {sameSite: "none"}); //, {httpOnly:true,}
  res.redirect('http://localhost:49146/index.html');
  //res.status(200).send({token: token});
   // , {maxAge:900000,httpOnly:true}change time (in sec)
  console.log('Generated');
  console.log(token);
});

// get datiregistrazioni of the account 
// SERVE ??
app.get('/api/datiregistrazioni', authenticateToken, (request, response) => {
  console.log('Registrazioni');
  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
  }

  let q = "SELECT drive, memoria_interna AS mem, 'path' FROM datiregistrazioni WHERE IDAcc = " + String(acc) +";";
  querySql(q, response, (result) => {
    response.status(200).send(result);
  });
});

app.get('/api/notifica', authenticateToken, (request, response) => {
  console.log('Notifica');
  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
  }

  let q = "SELECT IDNot, confermata, datanot, testo FROM notifica WHERE IDAcc = " + String(acc) +" ORDER BY datanot desc;";
  querySql(q, response, (result) => {
    response.status(200).send(result);
  });
});

app.get('/api/account', authenticateToken, (request, response) => {
  console.log('Account');
  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
    return;
  }

  let q = "SELECT nome, cognome, capo_famiglia FROM BeSafeDB.user WHERE IDAcc = " + 
        String(acc) +" ORDER BY capo_famiglia DESC;";
  querySql(q, response, (result) => {
    console.log(result);
    response.status(200).send(result);
  });
});

app.get('/api/impostazioni', authenticateToken, (request, response) => {
  console.log('Impostazioni');
  
  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
    return;
  }

  let q = "SELECT IDImp, animali, notte as notturna, gps as geolocalizzazione, ore_inizio, ore_fine," +
  " salvare_quanto FROM impostazioni WHERE IDAcc = " + String(acc) +";";
  
  querySql(q, response, (result) => {
    result = result[0];
    let q1 = "select drive, memoria_interna as mem from datiregistrazioni where IDAcc = " + String(acc)+";";
    querySql(q1, response, (result1) => {
      result1 = result1[0];
      if (result1.drive || result1.mem) {
        result['salvare'] = true;
      }

      let q2 = "SELECT contatto FROM contatti WHERE idimp = "+ String(result.IDImp) +";";
      querySql(q2, response, (result2) => {
        let contatti = {};
        for (let i = 0; i < result2.length; i++) {
          contatti[i] = result2[i].contatto;
        }
        result['contatti'] = contatti;
        response.status(200).send(result);
      });
    });
    
    

    
  });
}); // TODO add api/create token

