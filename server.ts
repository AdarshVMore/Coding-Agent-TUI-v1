import express from "express"
import { providers } from "./providers"

export const loggedIn:any = {
    "openai": "",
    "anthropic": "",
    "gemini": ""
}
export const active = {
  provider: "",
  apiKey: "",
};

const app = express()

app.use(express.json())

app.get("/api/providers", (req, res)=>{
    console.log("api hitt")
    res.status(200).send({message: providers})
})
app.post("/api/login", (req, res)=>{
    console.log("hitting login", req.body)
    const {provider, apiKey} = req.body
    console.log("logged in to ", provider , "with API key ", apiKey)
    loggedIn.provider = apiKey
    res.status(200).send({message: apiKey})
})
app.post("/api/logout", (req, res)=>{
    const {provider} = req.body
    console.log("logged out of ", provider )
    res.status(200).send({message: `Logged Out of ${provider}` })
})
app.post("/api/set", (req, res)=>{
    const {provider} = req.body
    active.provider = provider
    console.log("set provider to ", provider, "having api ", loggedIn.provider)
    res.status(200).send({provider: provider, apiKey: loggedIn.provider})
})

app.listen(3000, ()=>{console.log("server starteddd at 3000")})