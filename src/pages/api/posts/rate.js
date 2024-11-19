import { ratePost } from "../../../controllers/rateController";

export default async function handler(req, res) {
  if (req.method === "POST") {
    return ratePost(req, res);
  } else {
    return res.status(405).json({ error: "Method ${req.method} allowed" });
  }
}
