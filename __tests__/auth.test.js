const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
// const UserService = require('../lib/services/UserService');

describe('test auth routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });
  afterAll(() => {
    return pool.query.end();
  });
  it('allow the user to sign up for the game via POST', async() => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send({ username: 'test1', password: 'test1' })
      .then(res => {
        expect(res.text).toEqual({
          userId: expect.any(String),
          username: 'test1',
          password: 'test1'
        });
      });

  });




});
