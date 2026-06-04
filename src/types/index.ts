export type execParams = {
    command: string
}
export type summarizeParams = {
    content: string
}
export type web_search = {
    query: string
}

export type singleReponseFormatForToolCall = {
  toolName: "exec" | "summarize" | "web_search" | "edit";
  inputs: execParams | summarizeParams | web_search;
  responseAcceptable: "yes" | "no";
  runningEvent: string;
  response: string;
};

export type AgentLoopToolCall = singleReponseFormatForToolCall[];
