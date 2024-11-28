import { NextApiRequest, NextApiResponse } from "next";
import { handleReport } from "../../../controllers/reportController";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
  } else {
    return handleReport(req, res);
  }
}
