import { GoogleGenAI } from "@google/genai";
import tools from "./tools.json";
import { AgentLoopToolCall } from "../types";

const toolsText = JSON.stringify(tools, null, 2);

const sysPrompt = `Your job is to solve the user's request by choosing the correct tools and using them step by step.
    You have access to the following tools:
    ${toolsText}    

    You are supposed to make 1 tool call at a time.
    Always respond with valid JSON only. Do not wrap it in markdown.
    Based on userPrompt you are supposed to respond in this format:
    [
      {
        "toolName": "exec" | "final",
        "inputs": {},
        "responseAcceptable": "yes" | "no",
        "runningEvent": "current running process in a small 4 words",
        "response": "final response when responseAcceptable is yes, otherwise empty string"
      }
    ]
    The tool runner will send the tool output back to you with the main user prompt.
    Do not call a tool to summarize, explain, rewrite, or reason over text.
    If the user asks for a summary and you already have the content, answer with toolName "final".

    If the tool output is enough to answer the main user prompt, respond with:
    [
      {
        "toolName": "final",
        "inputs": {},
        "responseAcceptable": "yes",
        "runningEvent": "Done",
        "response": "the final answer to show the user"
      }
    ]

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

    After every loop or AI call, check whether the latest tool output satisfies the original user prompt.
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
    (toolName === "web_search" &&
      isRecord(inputs) &&
      typeof inputs.query === "string") ||
    (toolName === "edit" &&
      isRecord(inputs) &&
      typeof inputs.filePath === "string" &&
      typeof inputs.edits === "string") ||
    (toolName === "final" && isRecord(inputs));

  return (
    (toolName === "exec" ||
      toolName === "web_search" ||
      toolName === "edit" ||
      toolName === "final") &&
    hasValidInputs &&
    (responseAcceptable === "yes" || responseAcceptable === "no") &&
    typeof value.runningEvent === "string" &&
    typeof value.response === "string"
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
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `These are all the tools we have:\n${toolsText}\n\n${prompt}`,
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
        return parseToolCalls(response);
      }
    }
  } catch (err) {
    console.log("we have an error : ", err);
  }
}
