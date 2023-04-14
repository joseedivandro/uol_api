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

app.post('./partipants', async (req, res) => {
    try {
        const participant = await participantRules.validateAsync(req.body)

        const partipanteLocalizar = await db.collection("participants").findOne(participant)

        if (partipanteLocalizar) return res.sendStatus(409)

        await db.collection("participants").insertOne({ ...participant, lastStatus: Date.now() })

        await db.collection("messages").insertOne({
            from: participant.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        })

        return res.sendStatus(201)

    } catch (err) {
        console.log(err)

        if (err.isJoi) return res.sendStatus(400)

        return res.sendStatus(500)
    }
}) 