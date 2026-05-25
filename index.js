const express = require("express");
const dotenv = require("dotenv");
const app = express();
const dns = require("dns/promises");
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dns.setServers(["1.1.1.1", "8.8.8.8", "0.0.0.0"]);
dotenv.config();
const PORT = process.env.PORT;

const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        deprecationErrors: true,
        version: ServerApiVersion.v1,
        strict: true
    }
});


app.use(express.json())
app.use(cors());
app.use(cors({ origin: "*" }));
// app.use(express.urlencoded({ extended: true }));

async function run() {
    try {
        // await client.connect();
        // await client.db("admin").command({ ping: 1 });

        const database = client.db("idea_vault");
        const collection = database.collection("ideas");

        const userAccounts = client.db("idea-vault-accounts");
        const userAccountsCollections = userAccounts.collection("user");

        app.get("/ideas", async (req, res) => {
            const cursor = await collection.find().toArray()
            res.send(cursor)
        })
        app.get("/ideas/:id", async (req, res) => {
            let id = await req.params.id;
            let filter = { _id: new ObjectId(id) };
            const cursor = await collection.findOne(filter);
            res.send(cursor);
        });
        app.patch("/userNameUpdate/:id", async (req, res) => {
            const id = await req.params.id;
            const body = req.body;

            const userName = await userAccountsCollections.updateOne({
                _id: new ObjectId(id)
            }, {
                $set: body
            })
            res.send(userName)
        })
        app.post("/userCreated",async(req,res)=>{
            const {id,data} = req.body;
             data.ownerId= id;
            const newIdea = await collection.insertOne(data);
            // console.log(id, data);
            // console.log(req.body)
            res.send(newIdea)
            
        })
        app.get("/userCreatedIdeas/:id", async (req, res) => {
            let userId = req.params.id
            const users = collection.find({ownerId: userId});
            
            const result = await users.toArray();
                                        
            const response = result.map(items => items.userIdea);
            console.log( userId);
            console.log(result);
            
            res.send(result);
        })
        app.get("/profileIdeas/:id", async (req, res) => {
            let userId = req.params.id
            const users = collection.find({ownerId: userId});

            const result = await users.toArray();
            
            res.send(result);
        })
        app.get("/updateUserIdes", async (req, res) => {
            const users = userAccountsCollections.find();
            const result = await users.toArray();
            const response = result.map(items => items.userIdea);
            res.send(response);
        })
        app.patch("/updateUserIdes/:id", async (req, res) => {
            let body = req.body
            let id = req.params.id;
            // let newBody = {id, body}
            // let newId = new ObjectId()
            // body.id=newId;
            const users = await collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: body
                });
            // console.log(newBody);
            console.log(users);
            console.log(body);

            res.send(users);
        });
        app.delete("/deleteUserIdea/:id", async (req, res) => {
            const id = new ObjectId( req.params.id);
            const users = await collection.deleteOne(
                { _id: id }
                );
            console.log(id);
            // console.log(body);
            res.send(users)
        })
        console.log("Database Pinged successfully");


    } catch (error) {
        console.log(error);
    }
}



run().catch(console.dir);
app.get("/", (req, res) => res.send({ message: "You will get all data in ideas endpoint", status: true }));
app.listen(PORT, () => console.log("Server running on Port: ", PORT, "http://localhost:" + PORT));