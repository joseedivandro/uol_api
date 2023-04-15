import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient, ObjectId } from "mongodb"
import { participantRules, messageRules } from "./caracterSchemas.js"


const PORT = 5000
const app = express()
let db

dotenv.config()

app.use(cors())
app.use(express.json())
app.listen(PORT, () => {
    console.log(`Initialized server: port ${PORT}`)
})



const mongoClient = new MongoClient(process.env.DATABASE_URL)

const dbConnected = await mongoClient.connect()

if (dbConnected) db = mongoClient.db()


app.post('/participants', async (req, res) => {
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

        if (err.isJoi) return res.sendStatus(422)

        return res.sendStatus(201)
    }
}) 


app.get("/participants", async (req, res) => {

    try {
        const participants = await db.collection("participants").find().toArray()

        return res.send(participants)
    } catch (err) {
        console.log(err)

        return res.sendStatus(500)
    }
})

app.post("/status", async (req, res) =>{

        try{
            const { user } = req.headers
            const statusUser = await db.collection("participants").findOne({name:user})

            if(!statusUser) return res.sendStatus(404)

            await db.collection("participants").updateOne({name: user}, {$set: {lastStatus: Date.now()} })

            return res.sendStatus(200)
            console.log("deu certo")
        }

        catch (erro){
            console.log("deu errado")

            return res.sendStatus(500)
        }


})