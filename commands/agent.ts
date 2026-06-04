import { Command } from "commander";
import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import db from "../prismaIndex";

async function main() {}

export const agentCommand = new Command("agent")
  .argument("<prompt>")
  .description("Runs the agent")
  .option("-p, --prompt <prompt>", "prompt", "")
  .action(async (prompt) => {
    const apiKey = await db.active.findMany({
      where: {
        provider: "openai",
      },
    });
    console.log("API ", apiKey);
    const ai = new GoogleGenAI({ apiKey: apiKey[1].apiKey });
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

    // console.log(response.text);
  });
