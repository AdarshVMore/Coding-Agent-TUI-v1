
import { Command } from 'commander';

export const logoutCommand = new Command("logout")
    .argument('<provider>')
    .description('Lets user logout from the provider')
    .option('-p, --provider <providerName>', 'Name of the provider (gemini, claude etc)', '')
    .action((provider) => {
        console.log("logging out for provider " + provider)
    })

