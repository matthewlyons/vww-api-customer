const db = require('./db');

const supertest = require('supertest');
const app = require('../index');

const request = supertest(app);

beforeAll(async () => await db.connect());

beforeEach(async () => await db.populateDatabase());

afterEach(async () => await db.clearDatabase());

afterAll(async () => await db.closeDatabase());

// Root Routes
test('Get All Customers', async () => {
  request.get('/').then((response) => {
    expect(response.status).toBe(200);
  });
});

test('Fails to Create Customer', async () => {
  request
    .post('/')
    .type('form')
    .set('Accept', /application\/json/)
    .then((response) => {
      expect(response.body.errors[0].message).toBe(
        'Customer Field: "name" is required.'
      );
      expect(response.status).toBe(400);
    });
});

test('Successfully Creates Customer', async () => {
  request
    .post('/')
    .type('form')
    .send({ name: 'Matthew' })
    .set('Accept', /application\/json/)
    .then((response) => {
      expect(response.body).toBeInstanceOf(Object);
      expect(response.status).toBe(200);
    });
});

// Search Routes
test('Search for Customer with Z in their Name', async () => {
  request.get('/search/Z').then((response) => {
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});

test('Search for Customer with I in their Name', async () => {
  request.get('/search/i').then((response) => {
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);
  });
});

test('Search for Customer with Symbol', async () => {
  request.get('/search/*').then((response) => {
    expect(response.status).toBe(400);
    expect(response.body.errors[0].message).toBe('Bad Search Query');
  });
});

// Single Customer Routes
test('Fail to Get Single Customer with Invalid ObjectId', async () => {
  let response = await request.get(`/single/sd51fs65df1s65d1f6sd5f1s`);

  expect(response.status).toBe(400);
  expect(response.body).toBeInstanceOf(Object);
  expect(response.body.errors[0].message).toBe('Bad Request');
});

test('Fail to Get Single Customer with Unused ObjectId', async () => {
  let response = await request.get(`/single/60cfdac7687ab25900586729`);

  expect(response.status).toBe(404);
  expect(response.body).toBeInstanceOf(Object);
  expect(response.body.errors[0].message).toBe('No Customer Found');
});

test('Get Single Customer', async () => {
  let response = await request.get('/');
  let singleCustomer = await request.get(`/single/${response.body[0]._id}`);

  expect(singleCustomer.status).toBe(200);
  expect(singleCustomer.body).toBeInstanceOf(Object);
});

test('Update Single Customer', async () => {
  let response = await request.get('/');
  let singleCustomer = await request
    .put(`/single/${response.body[0]._id}`)
    .type('form')
    .send({ name: 'Something' })
    .set('Accept', /application\/json/);

  expect(singleCustomer.status).toBe(200);
  expect(singleCustomer.body).toBeInstanceOf(Object);
  expect(singleCustomer.body.success).toBe(true);
});

test('Delete Single Customer', async () => {
  let response = await request.get('/');
  let singleCustomer = await request.delete(`/single/${response.body[0]._id}`);

  expect(singleCustomer.status).toBe(200);
  expect(singleCustomer.body).toBeInstanceOf(Object);
  expect(singleCustomer.body.success).toBe(true);
});
