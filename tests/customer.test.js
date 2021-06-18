const db = require('./db');

const supertest = require('supertest');
const app = require('../index');

const request = supertest(app);

beforeAll(async () => await db.connect());

afterEach(async () => await db.clearDatabase());

afterAll(async () => await db.closeDatabase());

describe('User', () => {
  it('Get initial route', async () => {
    request.get('/').then((response) => {
      expect(response.status).toBe(200);
    });
  });
  it('Fails to Create Customer', async () => {
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
  it('Successfully Creates Customer', async () => {
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
});
