import { Command } from "commander";
import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import db from "../prisma-init/prismaIndex";

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
    const ai = new GoogleGenAI({ apiKey: data[0].apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `you are supposed to give only 1 terminal command in return on what is been asked for nothing extra in return only the command : userPrompt:${prompt}`,
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
        const command = part.text;
        if (!command) {
          return;
        }
        console.log("ai returns this ====> \n", command);
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Execution error: ${error.message}`);
            return;
          }

          if (stderr) {
            console.error(`Standard error: ${stderr}`);
            return;
          }

          console.log(`Output:\n${stdout}`);
        });
      }
    }
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
