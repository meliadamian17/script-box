import { checkAuth } from "../../../utils/middleware";
import {
  getPost,
  updatePost,
  deletePost,
} from "../../../controllers/postsController";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getPost(req, res);
  } else if (req.method === "PUT") {
    return updatePost(req, res);
  } else if (req.method === "DELETE") {
    return deletePost(req, res);
  } else {
    return res.status(405).json({ error: "Method ${req.method} not allowed" });
  }
}
