const { MongoClient } = require("mongodb");

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'cadastro';
const client = new MongoClient(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true });
const ObjectId = require("mongodb").ObjectId;

const COLLECTION = "customers";

let singleton;

async function connect() {
  if (singleton) return singleton;

  await client.connect();
  singleton = client.db(databaseName);
  return singleton;
}

async function findAll() {
  const db = await connect();
  return db.collection(COLLECTION).find().toArray();
}

async function insert(customer) {
  const db = await connect();
  return db.collection(COLLECTION).insertOne(customer);
}

async function findOne(id) {
  const db = await connect();
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

async function findOneUser(user) {
  const db = await connect();
  return db.collection(COLLECTION).findOne({user: user});
}

async function update(id, customer) {
  const db = await connect();
  return db.collection(COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: customer });
}

async function deleteOne(id) {
  const db = await connect();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
}

module.exports = { findAll, insert, findOne, findOneUser, update, deleteOne }


// const { MongoClient, ObjectId } = require("mongodb");
// const mongodb = require('mongodb');

// // CRUD

// const connectionURL = 'mongodb://127.0.0.1:27017'
// const databaseName = 'cadastro'
// const MongoClient = new mongodb.MongoClient(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true })



// const COLLECTION = "customers";
 
// let singleton;
 
// MongoClient.connect((error, client) => {
//     if(error){
//         return console.log('Unable to connect to database')
//     }
//     console.log(`Connected correctly`)
// });

// async function connect() {
//     if (singleton) return singleton;
 
//     const client = new MongoClient(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true });
//     await client.connect();
 
//     singleton = client.db(process.env.MONGO_DATABASE);
//     return singleton;
// }

// async function findAll() {
//     const db = await connect();
//     return db.collection(COLLECTION).find().toArray();
// }
 
// module.exports = { findAll }