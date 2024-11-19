import { NextApiRequest, NextApiResponse } from "next";
import { executeInDocker } from "../../../utils/code_exec/dockerExecution";
import {
  ExecutionRequest,
  ExecutionResponse,
  ExecutionError,
} from "../../../utils/code_exec/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutionResponse | ExecutionError>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, language, stdin = "" } = req.body as ExecutionRequest;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

  try {
    const result = await executeInDocker({ language, code, stdin });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
}
