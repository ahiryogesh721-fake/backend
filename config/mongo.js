const mongoose = require("mongoose");
require("dotenv").config();

const directAtlasUri =
  "mongodb://ahiryogesh:ahiryogesh721@ac-fe08t6h-shard-00-00.fhprltu.mongodb.net:27017,ac-fe08t6h-shard-00-01.fhprltu.mongodb.net:27017,ac-fe08t6h-shard-00-02.fhprltu.mongodb.net:27017/?ssl=true&replicaSet=atlas-1065ub-shard-0&authSource=admin&retryWrites=true&w=majority&appName=tocxic";

const conectMongo = async () => {
  const mongoUri = process.env.MONGO_URI || directAtlasUri;
  await mongoose.connect(mongoUri);
  console.log("database is connected");
};

module.exports = conectMongo;
