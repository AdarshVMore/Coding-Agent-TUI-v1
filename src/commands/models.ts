import { Command } from "commander";
import { models } from "../agent/providers-data";

export const modelsCommand = new Command("models")
.argument('<provider>')
  .description('Returns all the supported models')
  .option('-m, --model <modelName>', 'name of the model', 'all')
  .action((provider) => {
    console.log("Listing models...");
    const providers = models[provider]
    for(let provider of providers){
      console.log(provider)
    }
});