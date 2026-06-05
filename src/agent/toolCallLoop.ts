import type {
  AgentLoopToolCall,
} from "../types/index.js";
import { aiCall } from "./aiCall.js";
import { bashExec, summarize, webSearch, editFile } from "./tools.js";

const toolsDir:any = {
  exec: (input: { command: string }, eventString:string) => bashExec(input.command, eventString),
  summarize: (input: { content: string}, eventString:string) => summarize(input.content, eventString),
  web_search: (input: { query: string}, eventString:string) => webSearch(input.query, eventString),
  edit: (input: { filePath: string; edits: string}, eventString:string) =>
    editFile(input.filePath, input.edits, eventString),
};

export async function toolFunctionCallLoop(response: AgentLoopToolCall, apiKey:string) {
    console.log("starting tool loop... \n\n\n", response)
  let finalResponse
  for (let singleToolCall of response) {
    if(singleToolCall.responseAcceptable === "yes"){
        console.log("calling tool : ", singleToolCall.toolName )
        const currentRes = await toolsDir[singleToolCall.toolName](singleToolCall.inputs, singleToolCall.runningEvent)
        finalResponse = aiCall(currentRes,apiKey)
    }
  }
  console.log(finalResponse)
}
// this syntax in interesting => an object of key:string and value:function => function having [params] and in execution it executes another function based on that params
