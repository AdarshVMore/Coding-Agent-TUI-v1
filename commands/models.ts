import { Command } from "commander";
import { models } from "../providers";

export const modelsCommand = new Command("models")
.argument('<provider>')
  .description('Returns all the supported models')
  .option('-m, --model <modelName>', 'name of the model', 'all')
  .action((provider) => {
    console.log("Listing models...");
    console.log(models)
    const providers = models.provider
    console.log(providers)
});