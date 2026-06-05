import { exec } from "child_process";
import { execParams, summarizeParams, web_search } from "../types/index";

export function bashExec(command: string, eventsString: string) {
  console.log("......" + eventsString);
  try {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`Standard error: ${stderr}`);
        return;
      }

      console.log();
    });
  } catch {}
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
