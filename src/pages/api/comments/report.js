import { reportItem } from "../../../controllers/reportController";
export default async function handler(req, res) {
  if (req.method === "POST") {
    return reportItem(req, res);
  } else if (req.method === "GET") {
    return getReports(req, res);
  } else {
    return res.status(405).json({ error: "Method ${req.method} allowed" });
  }
}
