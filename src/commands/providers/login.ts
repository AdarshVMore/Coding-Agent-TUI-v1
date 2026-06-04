import { Command } from "commander";
import axios from "axios";

const loggedInProviders = [];

export const loginCommand = new Command("login")
  .argument("<provider>")
  .argument("<apiKey>")
  .description("Lets user login into the provider (use it as default)")
  .option(
    "-p, --provider <providerName>",
    "Name of the provider (gemini, claude etc)",
    "",
  )
  .option("-a, --api_key <apiKey>", "Your api key", "")
  .action(async (provider, apiKey) => {
    const data: any = await axios.post("http://localhost:3000/api/login", {
      provider: provider,
      apiKey: apiKey,
    });
    apiKey = JSON.stringify(data.data);
    console.log(
      "set provider to ",
      provider,
      " here is the api key ",
      data.data,
    );
    loggedInProviders.push({ provider: provider, apiKey: apiKey });
    console.log("logging into " + provider + apiKey);
  });
