// Module for api
const Express = require("express"); 
const BodyParser = require("body-parser");
// Module to control MySQL local database
const mysql = require('mysql');
const cors = require('cors');
// Modules used for cookies
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookie = require('cookie-parser');
// Module to show not API files (ex: HTML, CSS)
const fs = require('fs');
// Modules for documentation
const swagger = require('swagger-ui-express');
const jsdoc = require('swagger-jsdoc');

// TODOS: buttons of index.html; button invite to famiglia.html; ore registrazione in info.html
//        conferma notifica in notifiche.html, update impostazioni, pulsante nuovo dispositivo
// API: Creare account single + tutto colleggato, token-login; vari DELETE
//    DELETE: account, user, notifiche, dispositivi
// DOVE SI METTONO le opzioni di salvaggio di registrazioni (drive, mem and path)??
// DOCUMENTAZIONE API

// add more contacts
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: "BeSafe API",
      description: "BeSafe API that permits to work with app database",
      contact: {
        name: "Simone Dao"
      },
      servers: ["http://localhost:49146/"]
    }
  },
  securityDefinitions: {
    JWT: {
      type: 'apiKey',
      description: 'JWT authorization of an API',
      name: 'Authorization',
      in: 'header',
    },
  },
  apis: ["index.js"]
};

const swaggerDocs = jsdoc(swaggerOptions);

// TODO: add to DOCS response 302 (redirect to login) when token is invalid

/**
 * @swagger
 * components:
 *  schemas:
 *    Impostazioni:
 *      type: object
 *      required:
 *      - animali
 *      - notturna
 *      - geolocalizzazione
 *      - contatti
 *      properties:
 *        animali:
 *          type: boolean
 *        notturna:
 *          type: boolean
 *        geolocalizzazione:
 *          type: boolean
 *        ore_inizio:
 *          type: string
 *          format: time
 *        ore_fine:
 *          type: string
 *          format: time
 *        casa:
 *          type: string
 *          format: binary
 *        salvare_quanto:
 *          type: string
 *          format: time
 *        contatti:
 *          type: object
 *          properties:
 *              "0":
 *                type: string
 *              "1":
 *                type: string
 *              "2":
 *                type: string
 *              "3":
 *                type: string
 *        
 * 
 *    Notifica:
 *      type: object
 *      required:
 *      - testo
 *      - confermata
 *      properties:
 *        testo:
 *          type: string
 *        confermata:
 *          type: boolean
 *    
 *    Dispositivo:
 *      type: object
 *      required:
 *      - angolazione
 *      - notturno
 *      properties:
 *        angolazione:
 *          type: integer
 *          minimum: 0
 *          maximum: 360
 *        notturno:
 *          type: boolean
 * 
 *    Utente:
 *      type: object
 *      required:
 *      - username
 *      - nome
 *      - cognome
 *      - capo_famiglia
 *      - domanda_S
 *      - risposta_S
 *      - telefono
 *      - email
 *      - password
 *      properties:
 *        username:
 *          type: string
 *        nome:
 *          type: string
 *        cognome:
 *          type: string
 *        capo_famiglia:
 *          type: boolean
 *        domanda_S:
 *          type: string
 *        risposta_S:
 *          type: string
 *        telefono:
 *          type: string
 *        email:
 *          type: string
 *        password:
 *          type: string
 *          format: password
 *        faceID:
 *          type: string
 *          format: binary
 *        impronta:
 *          type: string
 *          format: binary
 *    
 *    IDNotifica:
 *      type: object
 *      required:
 *      - IDNot
 *      properties:
 *        IDNot:
 *          type: integer
 *          minimum: 0
 *    
 *    Login:
 *      type: object
 *      required:
 *      - username
 *      - pass
 *      properties:
 *        username:
 *          type: string
 *        pass:
 *          type: string
 *          format: password
 *          
 */


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
  
  if (token == null) {
    console.log("Token not found");
    res.redirect('../frontend/login.html'); //return res.sendStatus(401);
    return res;
  } 

  jwt.verify(token, String(process.env.TOKEN_SECRET), (err, data) => {
    // if token is invalid, redirect to login page
    if (err) {
      console.log(err);
      res.redirect('../frontend/login.html'); //res.sendStatus(403); 
      return res;
    }
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

// create and configure the server
var app = Express(); 
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended:true }));
app.use(cors());
app.use(cookie()); // TODO: above (maybe can clear this)
// set API with documentation
app.use("/api-docs", swagger.serve, swagger.setup(swaggerDocs));

// connect to socket/port
app.listen(49146, () => { }); 
console.log("Start server on port 49146");


// control that acc is int (can be negative)
function checkAcc (acc) {
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
      console.log(err);
    } else {
      callback(result);
      // result can be null
      // can ADD some control
    }
  });
}

// read not API files and send them in response
function respondHtml (name, type, res) {
  fs.readFile(name, function(err,data){
    if (!err) {
        res.writeHead(200, {'Content-Type': type}); // delete type???
        res.write(data);
        res.end();
    } else {
        console.log(err);
        res.status(400).send('File does not exist');
    }
  });
}

// PAGES

// TRY this for html
// res.render('pages/index');
// res.render('pages/departments', {depatments}); <-- works in expressJS

// expressJS (.ejs) permit to include html code

// should make better

app.get('/', (request, response) => {
  respondHtml('../frontend/login.html', 'text/html', response);
});

app.get('frontend/*.html', (request, response) => {
  respondHtml('../frontend/'+request.params[0] + '.html', 'text/html', response);
});

app.get('/*.js', (request, response) => {
  respondHtml('../'+request.params[0] + '.js', 'script', response);
});

app.get('/*.css', (request, response) => {
  respondHtml('../'+request.params[0] + '.css', 'stylesheet', response);
});

app.get('/img/*', (request, response) => {
  respondHtml('../img/' + request.params[0], 'image/png', response);
});


// more restrictive(maybe also more secure) publication of app's files
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

// DA CANCELLARE :TODO

/**
 * @swagger
 * /api/temptoken:
 *  get:
 *    security:              # <--- ADD THIS
 *      - JWT: []     # <--- ADD THIS
 *    description: Restituisce il token valido per fare testing dell'applicazione (valido per 30 minuti).
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *        #schema:
 *        #    $ref: '#/definitions/PersonSimple'
 */

app.get('/api/temptoken', (req, res) => {
  let token = generateAccessToken('petr', 1);
  res.cookie('Authorization', token, {sameSite: "none"}); 
  res.redirect('../frontend/index.html');
  console.log('Generated');
  console.log(token);
});

//res.status(200).send({token: token}); 
   // , {maxAge:900000,httpOnly:true}change time (in sec) //, {httpOnly:true,}


/**
 * @swagger
 * /api/datiregistrazioni:
 *  get:
 *    security:  
 *      - JWT: []     
 *    description: Restituisce se l'utente vuole salvare le registrazioni su Drive o sul suo dispositivo. In caso 
 *                  uno dei due sia affermattivo, restituisce anche il percorso valido dove sono salvate.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *        #schema:
 *        #    $ref: '#/definitions/PersonSimple'
 */
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


/**
 * @swagger
 * /api/notifica:
 *  get:
 *    security:     
 *      - JWT: []   
 *    description: Restituisce la lista delle notifiche dell'account.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *        #schema:
 *        #    $ref: '#/definitions/PersonSimple'
 */
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


/**
 * @swagger
 * /api/account:
 *  get:
 *    security:     
 *      - JWT: []   
 *    description: Restituisce gli utenti dell'account.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *        #schema:
 *        #    $ref: '#/definitions/PersonSimple'
 */
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
    response.status(200).send(result);
  });
});


/**
 * @swagger
 * /api/impostazioni:
 *  get:
 *    security:     
 *      - JWT: []   
 *    description: Restituisce le attuali impostazioni dell'account.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *        #schema:
 *        #    $ref: '#/definitions/PersonSimple'
 */
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
});


// POST API


/**
 * @swagger
 * /api/confermanotifica:
 *  post:
 *    security:    
 *      - JWT: []  
 *    description: Imposta la notifica come confermata nel database. Per identificare la notifica
 *                  nel body della richiesta deve essere passato il suo ID (detto IDNot).
 *    requestBody:
 *      description: IDNot della notifica da confermare
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/IDNotifica'
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      400:
 *        description: La richiesta non contiene tutti i dati necessari.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 */
app.post('/api/confermanotifica', authenticateToken, (request, response) => {
  console.log('Conferma');
  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
  }
  //TODO: aggiungere controllo che notifica appartiene al dato account 
  let body = request.body;
  console.log(body.IDNot);
  if (!body.IDNot) response.status(400).send('Incorrect request');

  let q = "UPDATE notifica SET confermata=true WHERE IDNot = " + String(body.IDNot) +" ;";
  querySql(q, response, (result) => {
    response.status(200).send("La notifica e' stata confermata");
  });
});


/**
 * @swagger
 * /api/token:
 *  post:
 *    security:     
 *      - JWT: []   
 *    description: Crea un JWT token, se le credenziali sono corrette e corrispondono ad un account esistente. Il token
 *                  viene passato nel cookie Authorization. La pagina viene poi ridiretta verso la Home Page.
 *    requestBody:
 *      description: Le credenziali dell'utente nel formato JSON.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Login'
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      400:
 *        description: La richiesta non contiene tutti i dati necessari.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *        #schema:
 *        #    $ref: '#/definitions/PersonSimple'
 */
app.post('/api/token', (request, response) => {
  console.log('Creating token');
  
  let body = request.body;
  if (!body.username || !body.pass) {
    response.status(400).send('Incorrect request');
    return;
  }
  let q = 'select IDAcc, username from user where username = "'+body.username+'" and password = "'+body.pass+'";';
  
  querySql(q, response, (result) => {
    if (result[0]) {
      let token = generateAccessToken(result[0].username, result[0].IDAcc);
      response.cookie('Authorization', token, {sameSite: "none"}); //, {httpOnly:true,}
      response.redirect('../frontend/index.html');
    } else {
      response.status(400).send('Incorrect credentials!!');
    }

  });
});


/**
 * @swagger
 * /api/notifica:
 *  post:
 *    security:          
 *      - JWT: []   
 *    
 *    requestBody:
 *      description: Il testo della nuova notifica
 *         Specifica se la notifica sara confermata subito, senza chiederlo all'utente
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Notifica'
 *    produces:
 *      - application/json
 *    description: Questa API crea la nuova notifica per l'account.
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      400:
 *        description: La richiesta non contiene tutti i dati necessari.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *        #schema:
 *        #    $ref: '#/definitions/PersonSimple'
 */
app.post('/api/notifica', authenticateToken, (request, response) => { // serve autenticazione??
  console.log('Crea notifica');
  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
  }
  let body = request.body;
  console.log(body);
  if (!body.testo || !body.confermata) {
    response.status(400).send('Incorrect request');
    return;
  }
  var date_time = new Date();
  let q = "INSERT INTO notifica(confermata, datanot, testo, IDAcc) VALUES ("+body.confermata+ 
      ', "'+ date_time.toISOString().split(".")[0] +'", "'+ body.testo+'", '+acc+");";
  
  querySql(q, response, (result) => {
    response.status(200).send("La notifica e' stata creata correttamente");
  });
});


/**
 * @swagger
 * /api/user:
 *  post:
 *    security:    
 *      - JWT: []  
 *    description: Aggiunge un nuovo utente all'account esistente.
 *    requestBody:
 *      description: Utente nel formato JSON
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Utente'
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *      400:
 *        description: La richiesta non contiene tutti i dati necessari.
 */
app.post('/api/user', authenticateToken, (request, response) => { 
  console.log('Aggiungi user ad account');
  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
  }
  let body = request.body;
  if (!body.username || !body.nome || !body.capo_famiglia || !body.risposta_S || !body.cognome || !body.telefono 
    || !body.domanda_S || !body.email || !body.password) {
    response.status(400).send('Incorrect request');
    return;
  }
  if (!body.faceID) {
    body['faceID'] = "null";
  }
  if (!body.impronta) {
    body['impronta'] = "null";
  }
  
  let q = "insert into user(IDAcc, faceID, username, nome, capo_famiglia, risposta_S, cognome, telefono, domanda_S, email, password, impronta)"+
    " values ("+acc+", "+body.faceID+', "'+body.username+ '", "' +body.nome+'", '+body.capo_famiglia+', "'+body.risposta_S +
      '", "'+body.cognome+'", "'+body.telefono+'", "'+body.domanda_S+'", "'+body.email+'", "'+body.password+'", '+body.impronta+');';
  
  querySql(q, response, (result) => {
    response.status(200).send("Lo user e' stato aggiunto correttamente");
  });
});


/**
 * @swagger
 * /api/impostazioni:
 *  post:
 *    security:     
 *      - JWT: []   
 *    description: Modifica le impostazioni dell'account.
 *    requestBody:
 *      description: Impostazioni nel formato JSON
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Impostazioni'
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *      400:
 *        description: La richiesta non contiene tutti i dati necessari.
 *        
 */
 app.post('/api/impostazioni', authenticateToken, (request, response) => { // forse meglio put
  console.log('Modifica impostazioni');

  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
  }
  let body = request.body;
  console.log(body);

  if (!body.contatti || 
       (body.contatti.length > 4) || (body.contatti.length < 0)) { // control existence better (!body.contatti.length ||)
        console.log(!body.animali)  // !body.animali || !body.notturna || !body.geolocalizzazione || 
        console.log(!body.notturna)
        console.log(!body.geolocalizzazione)
        console.log(!body.contatti)
        console.log(!body.contatti.length)
        console.log((body.contatti.length > 4) || (body.contatti.length < 0));
    response.status(400).send('Incorrect request');
    return;
  }
  if (!body.notturna) {
    body['ore_inizio'] = "null";
    body['ore_fine'] = "null";
  }
  if (!body.geolocalizzazione) {
    body['casa'] = "null";
  }
  if (!body.salvare_quanto) {
    body['salvare_quanto'] = "null";
  }
  
  let q0 = "select idimp from impostazioni where idacc = "+String(acc)+";";
  console.log(q0)
  querySql(q0, response, (result0) => {
    let idimp = result0[0].idimp;
    let q = "UPDATE impostazioni SET animali = "+body['animali']+ ", notte="+body['notturna']+", gps="+body['geolocalizzazione']+
      ", ore_inizio="+body['ore_inizio']+", ore_fine=" +body['ore_fine']+', salvare_quanto ="'+body['salvare_quanto']+
      '" , casa="'+body['casa']+'" WHERE idimp = ' + String(idimp) +";";

    console.log(q);
    
    querySql(q, response, (result) => {
        let q1 = "DELETE FROM contatti WHERE idimp = "+ String(idimp) +";";
        querySql(q1, response, (result1) => {
          let q2 = "INSERT INTO contatti(contatto, idimp) VALUES ";
          let contatti = body.contatti;
          console.log(contatti);
          console.log(contatti.length);
          for (let i in contatti) {
            q2 = q2 + ('("'+String(i) + '", ' + String(idimp) + "),");
          }
          q2 = q2.slice(0, -1) + ";"
          console.log(q2);
          querySql(q2, response, (result2) => {
            response.status(200).send('Impostazioni sono state modificate');
          });
        });
    });
  });
});


/**
 * @swagger
 * /api/dispositivo:
 *  post:
 *    security:    
 *      - JWT: []  
 *    description: Aggiunge un nuovo dispositivo all'account esistente.
 *    requestBody:
 *      description: I dati del dispositivo nel formato JSON
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Dispositivo'
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: La richiesta e' stata elaborata correttamente.
 *      404:
 *        description: L'account ricavato dal cookie Authorization non esiste nel database dell'applicazione.
 *      400:
 *        description: La richiesta non contiene tutti i dati necessari.
 *       
 */
 app.post('/api/dispositivo', authenticateToken, (request, response) => { 
  console.log('Aggiunge dispositivo ad account');
  acc = checkAcc(request.acc);
  if (!acc) {
    response.status(404).send('Account does not exist');
  }
  let body = request.body;
  /*if (!body.username || !body.nome || !body.capo_famiglia || !body.risposta_S || !body.cognome || !body.telefono 
    || !body.domanda_S || !body.email || !body.password) {
    response.status(400).send('Incorrect request');
    return;
  }
  if (!body.faceID) {
    body['faceID'] = "null";
  }
  if (!body.impronta) {
    body['impronta'] = "null";
  }*/
  
  let q = "insert into dispositivo(IDAcc, angolazione, notturno)"+
    " values ("+acc+", "+body.angolazione+', "'+body.notturno+');';
  
  querySql(q, response, (result) => {
    response.status(200).send("Il dispositivo e' stato aggiunto correttamente");
  });
});