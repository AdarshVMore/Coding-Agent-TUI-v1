import { exec } from "child_process";

export function bashExec(command: string) {
  console.log("ai returns this ====> \n", command);
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

      console.log(`Output:\n${stdout}`);
    });
  } catch {}
}

export function summarize(content:string){
    return `summarize this content: \n ${content}`
}

export function webSearch(query:string){
    // will integrate tavily api
}

export function editFile(filePath:string, edits:string){
    // dont know how editing happens
}