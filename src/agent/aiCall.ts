import { GoogleGenAI } from "@google/genai";
import tools from "./tools.json";
import { AgentLoopToolCall } from "../types";

const sysPrompt = `Your job is to solve the user's request by choosing the correct tools and using them step by step.
    You have access to the following tools:
    ${tools}    

    you are suppose to make 1 tool call at a time , 
    based on userPrompt you are supposed to responsd in this format
    [
      {
        toolName: //name of the tool that has to be executed now from available tools,
        inputs: // inputs required to call that available tool,
        responseAcceptable: // this field is supposed to judge the tool response, if the tool response if finally fulfilled the users request in its prompt answer it in "yes" or "no". with for response from AI the tools responseAcceptable will be "no" cause 
        runningEvents: // current running process in a small 4 words
        response": // final response will be here when responseAcceptable is true
      }
    ]
    and that tool will send that toolcalls response with next prompt back to you along with main user prompt

    you are supposed to check if the toolCall's response sent to you is acceptable to the main userPrompt if it is then 

    send a final response with responseAcceptable as "yes" and a response as the final response to display based on UserPrompt


   
    User request:
    Prompt 1: "Summarize the code present in file src/index.ts"
    
    Response 1:
    
    [
        {
            "toolName": "exec",
            "inputs": {
                "command": "cat src/index.ts"
            },
            "responseAcceptable": "no",
            "runningEvent": "Reading file before editing",
            "response": ""
        }
    ]

    After every loop or an AI Call check which response is acceptable and in next response mark that tools responseAcceptable as "yes"
    `;

function getJsonText(text: string) {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isToolCall(value: unknown): value is AgentLoopToolCall[number] {
  if (!isRecord(value)) {
    return false;
  }

  const toolName = value.toolName;
  const responseAcceptable = value.responseAcceptable;
  const inputs = value.inputs;

  const hasValidInputs =
    (toolName === "exec" &&
      isRecord(inputs) &&
      typeof inputs.command === "string") ||
    (toolName === "summarize" &&
      isRecord(inputs) &&
      typeof inputs.content === "string") ||
    (toolName === "web_search" &&
      isRecord(inputs) &&
      typeof inputs.query === "string") ||
    (toolName === "edit" &&
      isRecord(inputs) &&
      typeof inputs.filePath === "string" &&
      typeof inputs.edits === "string");

  return (
    (toolName === "exec" ||
      toolName === "summarize" ||
      toolName === "web_search" ||
      toolName === "edit") &&
    hasValidInputs &&
    (responseAcceptable === "yes" || responseAcceptable === "no") &&
    typeof value.runningEvent === "string"
  );
}

function parseToolCalls(text: string): AgentLoopToolCall | undefined {
  try {
    const parsed: unknown = JSON.parse(getJsonText(text));

    if (!Array.isArray(parsed) || !parsed.every(isToolCall)) {
      console.error(
        "AI response JSON did not match the tool-call schema:",
        parsed,
      );
      return;
    }

    return parsed;
  } catch (error) {
    console.error("Could not parse AI response as JSON:", error);
  }
}

export async function aiCall(prompt: string, apiKey: string) {
  // actual params needed => provider:string, model:string, apiKey:string
  console.log("prompt ===> ", prompt);
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `these are all the tool we have: ${tools}, ${prompt}`,
      config: {
        systemInstruction: sysPrompt,
      },
    });

    const texts = response.candidates;

    if (!texts) {
      return;
    }

    for (let text of texts) {
      const content = text.content?.parts;
      if (!content) {
        return;
      }
      for (let part of content) {
        const response = part.text;
        if (!response) {
          return;
        }
        console.log(parseToolCalls(response))
        return parseToolCalls(response);
      }
    }
  } catch (err) {
    console.log("we have an error : ", err);
  }
}
