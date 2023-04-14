import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient, ObjectId } from "mongodb"
import { participantRules, messageRules } from "./caracterSchemas.js"


const PORT = 5000
const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())

app.listen(PORT, () => {
    const mongoClient = new MongoClient(process.env.DATABASE_URL);
    mongoClient.connect()
        .then(() => {
            const db = mongoClient.db();
            console.log("MongoDB connected");
            // configure your API routes and other middleware here
        })
        .catch((err) => {
            console.error("Failed to connect to MongoDB", err);
            process.exit(1);
        });  
    console.log(`Initialized server: port ${PORT}`);
});