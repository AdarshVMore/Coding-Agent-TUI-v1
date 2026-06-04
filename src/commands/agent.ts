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
        console.log("ai returns this ====> \n", command)
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

// read file
// write file
// edit file
