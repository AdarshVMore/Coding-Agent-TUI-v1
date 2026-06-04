import axios from "axios";
import { Command } from "commander";

export const listProviderCommand = new Command("list")
  .description("Lets user set the default provider:")
  .option(
    "-p, --provider <providerName>",
    "Name of the provider (gemini, claude etc)",
    "",
  )
  .action(async () => {
    try {
      const providers:any = await axios.get("http://localhost:3000/api/providers");
      const array = providers.data.message
      console.log("All Providers are")
      for(let provider of array){
          console.log("    ",provider);
      }
    } catch (err) {
      console.log(err);
    }
  });
