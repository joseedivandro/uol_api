import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient, ObjectId } from "mongodb"
import { participantRules, messageRules } from "./caracterSchemas.js"
import dayjs from "dayjs"


const PORT = 5000
const app = express()
let db

dotenv.config()

app.use(cors())
app.use(express.json())
app.listen(PORT, () => {
    console.log(`Initialized server: port ${PORT}`)
})

timeAtividade()

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

        return res.sendStatus(500)
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

app.post("/messages", async (req, res)=>{
    try{
            const message = await messageRules.validate(req.body)
            const { user } = req.headers
            const statusMessage = await db.collection("participants").findOne({name: user})

            if(!statusMessage) return res.sendStatus(422)

            const messagePosted = await db.collection("messages").insertOne({
                from: user,...message,
                time: dayjs().format('HH:mm:ss')

            })

            if(messagePosted) return res.sendStatus(201)

    }catch{

        console.log("deu ruim")

        if(err.isJoi) return res.sendStatus(422)

        return res,sendStatus(500)
    }
})

app.get("messages", async (req, res)=>{
    try{
        const { message } = req
        const { user } = req.headers

        const messages = await db.collection("messages").find ({
            $or:[
                {from: user},
                {to: user},
                {to: "Todos"}
            ]
        }).toArray()

        if(message.limit){

            const limitMessages = Number(message.limit)

            if(limitMessages < 1 || isNaN(limitMessages)) return res.sendStatus(422)

            return res.send([...messages].slice(-limitMessages).reverse())
        }

        return res.send([...messages].reverse())
    } catch{
        console.log("deu ruim")

        return res.sendStatus(500)
    }
})

function timeAtividade() {

    setInterval(async () => {

        const timeLimit = Date.now() - 15000

        try {
            const participants = await db.collection("participants").find().toArray()

            participants.forEach(async (participant) => {

                if (participant.lastStatus < timeLimit) {

                    await db.collection("participants").deleteOne({ _id: new ObjectId(participant._id) })


                    await db.collection("messages").insertOne({
                        from: participant.name,
                        to: 'Todos',
                        text: 'sai da sala...',
                        type: 'status',
                        time: dayjs().format('HH:mm:ss')
                    })
                }
            })

        } catch (erro) {
            console.log(erro)

            return res.sendStatus(500)
        }

    }, 15000)
}