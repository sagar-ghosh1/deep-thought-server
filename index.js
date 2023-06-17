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

/// jwt token
app.post("/jwt", async (req, res) => {
  const user = req.body;
  // console.log(user)
  const token = jwt.sign(user, process.env.JWT_TOKEN, {
    expiresIn: "1d",
  });
  res.send({ token });
});

/// top instructor section
app.get("/top_instructor", async (req, res) => {
  const result = await instructorCollection.find().toArray();
  res.send(result);
});

/// POST user
app.post("/user", async (req, res) => {
  const user = req.body;
  console.log(user);
  const query = { email: user.email };
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "Already Added this user info" });
  } else {
    const result = await userCollection.insertOne(user);
    res.send(result);
  }
});

// GET user
app.get("/user", async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
});

/// GET user admin
app.get("/users/admin/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  const query = { email: email };

  const decoded = req.decoded.email;
  if (decoded !== email) {
    return res.status(403).send({ admin: false });
  }

  const user = await userCollection.findOne(query);
  const result = { admin: user?.role === "admin" };
  res.send(result);
});
