const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
// const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri = process.env.MONGODB_URI;

const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);

const port = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });
// async function runStableAPIConnect() {
//   try {
//     // Connect the client to the server (optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     const result = await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!",
//     );
//     return result;
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// runStableAPIConnect().catch(console.dir);

async function connectToMongoDB() {
  try {
    await client.connect();

    const db = client.db("hireloopDB");
    const jobCollection = db.collection("jobs");
    const companyCollection = db.collection("companies");

    app.get("/api/jobs", async (req, res) => {
      const query = {};
      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }
      if (req.query.status) {
        query.status = req.query.status;
      }
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/api/jobs/:id", async (req, res) => {
      const {id}= req.params;
      const query = {
        _id: new ObjectId(id)
      };
      const result = await jobCollection.findOne(query);
      res.send(result);
    })


    app.post("/api/jobs", async (req, res) => {
      const job = req.body;
      const newJobs={
        ...job,
        createdAt:new Date()
      }
      const result = await jobCollection.insertOne(newJobs);
      res.send(result);
      console.log(result, "result of creat job");
    });

    // companny related apis

    app.get("/api/my/companies", async (req, res) => {
      const query = {};
      if (req.query.recruiterId) {
        query.recruiterId = req.query.recruiterId;
      }
      const result = await companyCollection.findOne(query);
      res.send(result || {});
    });

    // app.post("/api/companies", async (req, res) => {
    //   const company = req.body;
    //   company.status = "pending";
    //   company.createdAt = new Date();

    //   const result = await companyCollection.insertOne(company);
    //   res.send(result);
    // });

    app.post("/api/companies", async (req, res) => {
      const company = {
        ...req.body,
        status: "approved", // TODO: admin page বানানোর পর "pending" করবেন
        plan: "Free",
        activeJobs: 0,
        jobLimit: 3,
        createdAt: new Date(),
      };

      const result = await companyCollection.insertOne(company);
      res.send(result);
    });

    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const starting = async () => {
  await connectToMongoDB();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

starting();
