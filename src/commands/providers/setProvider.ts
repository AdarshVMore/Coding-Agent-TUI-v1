import axios from "axios";
import { Command } from "commander";
let apiKey;
import db from "../../prisma-init/prismaIndex";

export const setProviderCommand = new Command("set")
  .argument("<provider>")
  .description("Lets user set the default provider:")
  .option(
    "-p, --provider <providerName>",
    "Name of the provider (gemini, claude etc)",
    "",
  )
  .action(async (provider) => {
    try {
      const data: any = await axios.post("http://localhost:3000/api/set", {
        provider: provider,
      });
      let x
      apiKey = data.data.apiKey;
      const y = await db.active.update({
        where: { provider: provider },
        data: { apiKey: apiKey },
      });
      if (!y) {
        x = await db.active.create({
          data: { provider: provider, apiKey: apiKey, isActive: true },
        });
      }

      console.log("x = ", x);
      console.log(
        "set provider to ",
        provider,
        " here is the api key ",
        data.data,
      );
    } catch (err) {
      console.log(err);
    }
  });
