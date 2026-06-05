export type execParams = {
    command: string
}
export type summarizeParams = {
    content: string
}
export type web_search = {
    query: string
}
export type editParams = {
  filePath: string;
  edits: string;
}

type baseToolCall = {
  responseAcceptable: "yes" | "no";
  runningEvent: string;
  response: string;
};

export type singleReponseFormatForToolCall =
  | (baseToolCall & {
      toolName: "exec";
      inputs: execParams;
    })
  | (baseToolCall & {
      toolName: "summarize";
      inputs: summarizeParams;
    })
  | (baseToolCall & {
      toolName: "web_search";
      inputs: web_search;
    })
  | (baseToolCall & {
      toolName: "edit";
      inputs: editParams;
    });

export type AgentLoopToolCall = singleReponseFormatForToolCall[];
