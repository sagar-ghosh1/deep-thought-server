require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.PAYMENT_SECRECT_KEY);
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "sai unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .send({ error: true, message: "bhai Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

// const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-tfmdlv0-shard-00-00.rnkzyeb.mongodb.net:27017,ac-tfmdlv0-shard-00-01.rnkzyeb.mongodb.net:27017,ac-tfmdlv0-shard-00-02.rnkzyeb.mongodb.net:27017/?ssl=true&replicaSet=atlas-8cmvoo-shard-0&authSource=admin&retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ez7uet8.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const courseCollection = client.db("deepThought").collection("Cart");
const userCollection = client.db("deepThought").collection("user");
const classCollection = client.db("deepThought").collection("addClass");
const instructorCollection = client.db("deepThought").collection("instructor");
const paymentCollection = client.db("deepThought").collection("payment");
const reviewCollection = client.db("deepThought").collection("review");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
