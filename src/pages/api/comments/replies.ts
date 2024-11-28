import { getCommentReplies } from "@/controllers/repliesController";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    return getCommentReplies(req, res);
  } else {
    return res.status(405).json({ error: "Method ${req.method} allowed" });
  }
}
