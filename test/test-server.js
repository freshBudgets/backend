var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
var supertest = require('supertest');
var server = supertest.agent('http://localhost:5000');


var token;
var userId;

describe('Test that unit testing is workng', function() {
  it('should GET is_up as true on /api/is_up', function(done){
    server
    .get('/api/is_up')
    //.set('Content-Type', 'application/x-www-form-urlencoded')
    .end(function(err, res) {
      res.body.success.should.equal(true);
      done();
    });
  });
});

describe('Register User', function() {
  it('should add user TESTING SERVER to the user database on /api/signup POST', function(done) {
      server
      .post('/api/signup')
      .send({firstName: 'TESTING', lastName: 'SERVER', email: 'testing@server.com', phoneNumber: 5551111111, password: 'password'})
      .expect('Content-type', /json/)
      .expect(200)
      .end(function(err, res) {
          res.status.should.equal(200);
          res.body.success.should.equal(true);
          token = res.body.token;
          done();
      });
  });
  it('should fail to add to add add user DUPLICATE NUMBER to the user database with a on /api/signup POST', function(done) {
    server
    .post('/api/signup')
    .send({firstName: 'DUPLICATE', lastName: 'NUMBER', email: 'testing@server.com', phoneNumber: 1234567890, password: 'password'})
    .expect('Content-type', /json/)
    .expect(200)
    .end(function(err, res) {
        res.status.should.equal(200);
        res.body.success.should.equal(true);
        token = res.body.token;
        done();
    });
});
});

// describe('Blobs', function() {
//   it('should list ALL blobs on /blobs GET');
//   it('should list a SINGLE blob on /blob/<id> GET');
//   it('should add a SINGLE blob on /blobs POST');
//   it('should update a SINGLE blob on /blob/<id> PUT');
//   it('should delete a SINGLE blob on /blob/<id> DELETE');
// });

// it('should create category', function(done) {
//   var login = chai.request(server).post('/login').send({"phoneNumber":1234567890, "password":"secret"}).body.token;
//   var res = 
//   console.log(login);
// });

// it('should list ALL blobs on /blobs GET', function(done) {
//     chai.request(server)
//       .get('/is_up')
//       .end(function(err, res){
//         res.should.have.status(200);
//         done();
//       });
//   });
  
//   it('should list ALL blobs on /blobs GET', function(done) {
//     chai.request(server)
//       .get('/blobs')
//       .end(function(err, res){
//         res.should.have.status(200);
//         res.should.be.json;
//         res.body.should.be.a('array');
//         done();
//       });
//   });
  