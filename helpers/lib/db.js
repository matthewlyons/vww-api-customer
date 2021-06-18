require('dotenv').config();

const mongoose = require('mongoose');

module.exports = {
  async connectDB() {
    let DB;
    DB = process.env.MONGO_URI;
    return new Promise((resolve, reject) => {
      mongoose
        .connect(DB, {
          useNewUrlParser: true,
          useCreateIndex: true,
          useFindAndModify: false,
          useUnifiedTopology: true
        })
        .then(async () => {
          resolve('MongoDB Connected');
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  },
  mongooseValidateRequest(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ errors: [{ message: 'Bad Request' }] });
    } else {
      next();
    }
  },
  mongooseValidateObjectID(ObjectID) {
    return mongoose.Types.ObjectId.isValid(ObjectID);
  }
};
