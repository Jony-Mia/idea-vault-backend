const express = require("express");
const dotenv = require("dotenv");
const app = express();
const dns = require("dns/promises");
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dns.setServers(["1.1.1.1", "8.8.8.8", "0.0.0.0"]);
dotenv.config();
const PORT = process.env.PORT;

const client = new MongoClient("mongodb+srv://jony_mia:jony_mia_db@cluster0.faotqao.mongodb.net/?appName=Cluster0", {
    serverApi: {
        deprecationErrors: true,
        version: ServerApiVersion.v1,
        strict: true
    }
});


app.get("/", (req, res) => {
    res.send({
        message: "You will get all data in ideas endpoint",
        status: true
    })
});

app.use(express.json())
app.use(cors());
app.use(cors({origin:"*"}));
// app.use(express.urlencoded({ extended: true }));

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });

        console.log("Database Pinged successfully");
        const database = client.db("idea_vault");
        const collection = database.collection("ideas");

        const userAccounts = client.db("idea-vault-accounts");
        const userAccountsCollections = userAccounts.collection("user");

        app.get("/ideas", async (req, res) => {
            const cursor = await collection.find().toArray();
            res.send(cursor)
        })
        app.get("/ideas/:id", async (req, res) => {
            let id = await req.params.id;
            let filter = { _id: new ObjectId(id) };
            const cursor = await collection.findOne(filter);
            res.send(cursor);
        });

        app.get("/userCreated/ideas", async (req, res) => {
            const users = userAccountsCollections.find();
            const result = await users.toArray();
            const result2 = result.map(items => items.userIdea);
            res.send(result2);
        })
        app.patch("/userCreated/:id", async (req, res) => {
            let body = req.body;
            let id = req.params.id;
            const users = await userAccountsCollections.updateOne(
                { _id: new ObjectId(id) },
                {
                    $push: { userIdea: body }
                });

            res.send(users);
        })
    } catch (error) {
        console.log(error);
    }
}
run().catch(console.dir);
app.listen(PORT, () => console.log("Server running on Port: ", PORT, "http://localhost:" + PORT));