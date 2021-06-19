const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectdb = async () => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true, useCreateIndex: true })
    console.log('MongoDB connected ...');
  } catch (error) {
    console.error(error.message);
    //Exit process with failure
    process.exit(1);
  }
}

module.exports = connectdb;
