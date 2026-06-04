import express from "express"
import { providers } from "../agent/providers-data"
import db from "../prisma-init/prismaIndex"

const app = express()

app.use(express.json())

app.get("/api/providers", (req, res)=>{
    console.log("api hitt")
    res.status(200).send({message: providers})
})
app.post("/api/login", async (req, res)=>{
    console.log("hitting login", req.body)
    const {provider, apiKey} = req.body
    const providerExists = await db.active.findUnique({where:{provider:provider}})
    if(providerExists){
        db.active.update({where: {provider:provider}, data:{apiKey:apiKey}})
    } else {
        await db.active.create({data:{provider: provider, apiKey:apiKey, isActive:false}})
    }
    console.log("logged in to ", provider , "with API key ", apiKey)
    
    res.status(200).send({message: apiKey})
})

app.post("/api/logout", (req, res)=>{
    const {provider} = req.body
    console.log("logged out of ", provider )
    res.status(200).send({message: `Logged Out of ${provider}` })
})

app.post("/api/set", async (req, res)=>{
    const {provider} = req.body
    const data = await db.active.findUnique({where: {provider: provider}})
    if(data?.apiKey){
        await db.active.update({where: {provider:provider}, data: {isActive:true}})
    }
    console.log("set provider to ", provider, "having api ", data?.apiKey)
    res.status(200).send({provider: provider, apiKey: data?.apiKey})
})

app.listen(3000, ()=>{console.log("server starteddd at 3000")})