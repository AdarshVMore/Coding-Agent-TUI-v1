import type { AgentLoopToolCall } from "../types/index.js";
import { aiCall } from "./aiCall.js";
import { bashExec, summarize, webSearch, editFile } from "./tools.js";

async function executeToolCall(singleToolCall: AgentLoopToolCall[number]) {
  switch (singleToolCall.toolName) {
    case "exec":
      return bashExec(
        singleToolCall.inputs.command,
        singleToolCall.runningEvent,
      );
    case "summarize":
      return summarize(
        singleToolCall.inputs.content,
        singleToolCall.runningEvent,
      );
    case "web_search":
      return webSearch(
        singleToolCall.inputs.query,
        singleToolCall.runningEvent,
      );
    case "edit":
      return editFile(
        singleToolCall.inputs.filePath,
        singleToolCall.inputs.edits,
        singleToolCall.runningEvent,
      );
  }
}

export async function toolFunctionCallLoop(
  response: AgentLoopToolCall,
  apiKey: string,
  userPrompt:string
) {
  let finalResponse;
  for (let singleToolCall of response) {
    if (singleToolCall.responseAcceptable === "no") {
      const currentRes = await executeToolCall(singleToolCall);
      finalResponse = await aiCall(
        `Tool output:\n${currentRes} UserPrompt:\n${userPrompt}`,
        apiKey,
      );
    }
  }
}
// this syntax in interesting => an object of key:string and value:function => function having [params] and in execution it executes another function based on that params
