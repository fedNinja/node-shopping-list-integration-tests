const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const should = chai.should();
chai.use(chaiHttp);

describe('Recipes', function() {

  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });
  it('should list recipes on GET', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        res.should.have.status(200);
        //console.log(res);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.should.have.length.of.at.least(1);
        const expectedKeys = ['name', 'id', 'ingredients'];
        res.body.forEach(function(item) {
          console.log(item);
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

//POST request
  it('should add an item on POST', function() {
    const newItem = {name: 'tomato soup', ingredients: ['tomatoes','onions','ginger']};
    return chai.request(app)
      .post('/recipes')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.id.should.not.be.null;
        // response should be deep equal to `newItem` from above if we assign
        // `id` to it from `res.body.id`
        res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

  //Update data...PUT request
  it('should update an item on PUT', function() {
    const updateData = {
      name: 'Pasta',
      ingredients: ['tomato','basil','fussili']
    };

    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      // prove that the PUT request has right status code
      // and returns updated item
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal(updateData);
      });  
  });

  //delet data...Delete request
  it('should delete data on delete', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

});
