const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Customer = require('../models/Customer');

const mongod = new MongoMemoryServer();

module.exports = {
  async connect() {
    const uri = await mongod.getUri();
    const mongooseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 10
    };
    await mongoose.connect(uri, mongooseOpts);
  },
  async closeDatabase() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  },
  async clearDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  },
  async populateDatabase() {
    await Customer.insertMany([
      { name: 'Kali', orders: ['60cfdac7687ab25900586728'] },
      { name: 'Chuck' },
      { name: 'Jessica' },
      { name: 'Bill' }
    ]);
  }
};
