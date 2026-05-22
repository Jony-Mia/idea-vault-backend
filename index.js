const express = require("express");
const dotenv = require("dotenv");
const app = express();
const dns = require("dns/promises");
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dns.setServers(["1.1.1.1","8.8.8.8"]);
dotenv.config();
const PORT = process.env.PORT;

const client = new MongoClient(process.env.MONGODB_URI,{
    serverApi:{
        deprecationErrors: true,
        version: ServerApiVersion.v1,
        strict: true
    }
})
app.use(express.json())
app.use(cors());

async function run() {
try {
    await client.connect();
    await client.db("admin").command({ping:1});

    console.log("Database Pinged successfully");
    const database = client.db("idea_vault");
    
    const collection = database.collection("ideas");
    app.get("/ideas", async (req,res)=>{
        const cursor = await collection.find().toArray();
        console.log(cursor);
        res.send(cursor)
    })
    app.get("/ideas/:id", async (req,res)=>{
        let id = await req.params.id;
        let filter = {
            _id: new ObjectId(id)
        }
        const cursor = await collection.findOne(filter)

        // console.log(cursor);
        res.send(cursor) 
    })
} catch (error) {
    console.log(error);
    // await client.close()
}
}
app.get("/", async(req,res)=>{
    res.send({
        message:"You will get all data in ideas endpoint",
        status: true
    })
})
run().catch(console.dir);
app.listen(PORT, ()=>console.log("Server running on Port: ", PORT, "http://localhost:"+PORT));