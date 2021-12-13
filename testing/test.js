const test = require('tape');
const request = require('supertest');

// 2 ways to get app with cookies
//   first: server must be launch separatly
const agent = request.agent('http://localhost:49146');

//   second: server will be launch, so to test again I need to stop it
//const agent = request.agent(require("../api/index.js"));


// TESTS

agent.get('/').expect(302, function(err) {
    console.log(err);
});

agent.post('/api/token').expect(302, function(err) {
    console.log(err);
});

test('Login con credenziali giusti + cookies', function (assert) {
    var credenziali = {username:"fili", pass:"cadodalpero"};
    agent
        .post('/api/token')
        .send(credenziali)
        .expect(302)
        .end(function (err, res) {

            assert.error(err, 'No error');
            assert.end();
        });
});

test('I membri della famiglia ritornati sono corretti', function (assert) {
    agent
        .get('/api/famiglia')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
            var expectedUsers = [{nome: "Petr", cognome: "Sabel", capo_famiglia: 1},
                {nome: "Simone", cognome: "Dao", capo_famiglia: 0},  
                {nome: "Filippo", cognome: "Grilli", capo_famiglia: 0}];

            assert.error(err, 'No error');
            assert.same(res.body, expectedUsers, 'Famiglia giusta');
            assert.end();
        });
});


