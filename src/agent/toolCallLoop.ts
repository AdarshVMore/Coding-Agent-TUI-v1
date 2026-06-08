import type { AgentLoopToolCall } from "../types/index.js";
import { aiCall } from "./aiCall.js";
import { bashExec, webSearch, editFile } from "./tools.js";

async function executeToolCall(singleToolCall: AgentLoopToolCall[number]) {
  switch (singleToolCall.toolName) {
    case "exec":
      return bashExec(
        singleToolCall.inputs.command,
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
    case "final":
      return singleToolCall.response;
  }
}

export async function toolFunctionCallLoop(
  response: AgentLoopToolCall,
  apiKey: string,
  userPrompt:string
) {
  for (let singleToolCall of response) {
    if (singleToolCall.responseAcceptable === "yes") {
      return response;
    }

    if (singleToolCall.responseAcceptable === "no") {
      const currentRes = await executeToolCall(singleToolCall);
      return aiCall(
        `Original user prompt:\n${userPrompt}\n\nLatest tool output:\n${currentRes}`,
        apiKey,
      );
    }
  }
}

// guard rails
// context managment