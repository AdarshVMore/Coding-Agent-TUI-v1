import { Command } from "commander";
import { GoogleGenAI } from "@google/genai";
import db from "../prisma-init/prismaIndex";
import { toolFunctionCallLoop } from "../agent/toolCallLoop";
import tools from "../agent/tools.json";
import { aiCall } from "../agent/aiCall";

async function main() {}

export const agentCommand = new Command("agent")
  .argument("<prompt>")
  .description("Runs the agent")
  .option("-p, --prompt <prompt>", "prompt", "")
  .action(async (prompt) => {
    const data = await db.active.findMany({
      where: {
        isActive: true,
      },
    });

    const response:any = aiCall(prompt, data[0].apiKey)
    toolFunctionCallLoop(response, data[0].apiKey );
  });

// read file  - done
// write file - done
// edit file  - done

// agent loop =>
// systemPrompt: these are the tools we have: {} , respond with the set of tools we need to use in an object [{toolName: "exec", inputs: {command: "cat src/indes.ts"} , responseAcceptable: "yes", runningEvent:"...running terminal command to read file", response: "//prompt again to the loop"}, {toolName: "summarize", inputs:{content: "----"}, responseAcceptable: "yes", runningEvent:"...running terminal command to read file", response: "//prompt again to the loop }]
// userPrompt: summarize this file "src/x.json"
// 1. give me a plan of tool we need to use, from these existing tools in a format
// 2. run through the format give the reponse to AI back, he will respond back updating the format
// => cat x.json => run it in exec => get content send to summarize tool
// 3. untill whole formats responseAcceptable === "yes" loop will be running, and final response will be console logged

// better workflow to build
// 1. user says agent <prompt> ,
// CLI asks for provider [a dropdown] ,
// if API_KEY ? select Model / auto-select , else enter API KEY ,
// start AgentLoop [give streams of response with "runningEvent"]
// 2. spawns a docker continer with KVM + Quemu to create a Sandbox for some execution of tasks provided
