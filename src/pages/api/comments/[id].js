import { checkAuth } from "../../../utils/middleware";
import {
  updateComment,
  deleteComment,
} from "../../../controllers/commentsController";
export default async function handler(req, res) {
  if (req.method === "PUT") {
    return updateComment(req, res);
  } else if (req.method === "DELETE") {
    return deleteComment(req, res);
  } else {
    return res.status(405).json({ error: `Method ${req.method} allowed` });
  }
}
