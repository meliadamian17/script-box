export interface LanguageConfig {
  image: string;
  fileName: string;
  runCommand?: string;
  compileCommand?: string;
  useEntrypoint?: boolean;
}

export interface ExecutionRequest {
  language: string;
  code: string;
  stdin?: string;
}

export interface ExecutionResponse {
  output: string;
}

export interface ExecutionError {
  error: string;
}
