import { exec } from "child_process";

export function bashExec(command: string, eventsString: string) {
  console.log("......" + eventsString);
  console.log("<======== Command is =========> \n", command)
  return new Promise<string>((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(`Execution error: ${error.message}`);
        return;
      }

      if (stderr) {
        resolve(`Standard error: ${stderr}`);
        return;
      }

      resolve(stdout);
    });
  });
}

export function summarize(content: string, eventsString: string) {
  console.log("......" + eventsString);

  return `summarize this content: \n ${content}`;
}

export function webSearch(query: string, eventsString: string) {
  console.log("......" + eventsString);

  // will integrate tavily api
}

export function editFile(
  filePath: string,
  edits: string,
  eventsString: string,
) {
  console.log("......" + eventsString);

  // dont know how editing happens
}
