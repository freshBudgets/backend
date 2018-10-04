var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
var supertest = require('supertest');
var server = supertest.agent('http://localhost:5000');

var token;
var userId;
var budgetID;

// describe('Test that unit testing is workng', function() {
//   it('should GET is_up as true on /api/is_up', function(done){
//     server
//     .get('/api/is_up')
//     //.set('Content-Type', 'application/x-www-form-urlencoded')
//     .end(function(err, res) {
//       res.body.success.should.equal(true);
//       done();
//     });
//   });
// });

// describe('Register User', function() {
//   it('should add user TESTING SERVER to the user database on /api/signup POST', function(done) {
//       server
//       .post('/api/signup')
//       .send({firstName: 'TESTING', lastName: 'SERVER', email: 'testing@server.com', phoneNumber: 5551111111, password: 'password'})
//       .expect('Content-type', /json/)
//       .expect(200)
//       .end(function(err, res) {
//           res.status.should.equal(200);
//           res.body.success.should.equal(true);
//           token = res.body.token;
//           done();
//       });
//   });
//   it('should fail to add to add add user DUPLICATE NUMBER to the user database because phone number is already in use on /api/signup POST', function(done) {
//     server
//     .post('/api/signup')
//     .send({firstName: 'DUPLICATE', lastName: 'NUMBER', email: 'duplicate@number.com', phoneNumber: 1234567890, password: 'password'})
//     .expect('Content-type', /json/)
//     .expect(200)
//     .end(function(err, res) {
//         res.status.should.equal(200);
//         res.body.success.should.equal(false);
//         done();
//     });
//   });
// });

describe('Login', function() {
  it('should log user in on /api/login', function(done) {
    server
    .post('/api/login')
    .send({phoneNumber: 5551111111, password: 'password'})
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

describe('Create Category', function() {
  it('should create budget catagory Test Server Budget on /api/budget POST', function(done) {
      server
      .post('/api/budget')
      .set('token', token)
      .send({budgetName: 'Test Server Budget', budgetLimit: 100})
      .expect('Content-type', /json/)
      .expect(200)
      .end(function(err, res) {
          res.status.should.equal(200);
          res.body.success.should.equal(true);
          budgetID = res.body.budgetID;
          done();
      });
  });
});

describe('Edit Category', function() {
  it('should edit budget catagory Test Server Budget on /api/budget/edit POST', function(done) {
      server
      .post('/api/budget/edit')
      .set('token', token)
      .send({budgetID: budgetID, newBudgetName: 'Test Server Budget Updated', newBudgetLimit: 50})
      .expect('Content-type', /json/)
      .expect(200)
      .end(function(err, res) {
          res.status.should.equal(200);
          res.body.success.should.equal(true);
          done();
      });
  });
});

describe('Delete Category', function() {
  it('should delete budget catagory Test Server Budget on /api/budget/delete POST', function(done) {
      server
      .post('/api/budget/delete')
      .set('token', token)
      .send({budgetID: budgetID})
      .expect('Content-type', /json/)
      .expect(200)
      .end(function(err, res) {
          res.status.should.equal(200);
          res.body.success.should.equal(true);
          done();
      });
  });
});
  