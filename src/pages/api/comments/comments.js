import {
  getComments,
  createPostComment,
} from "../../../controllers/commentsController";
export default async function handler(req, res) {
  if (req.method === "GET") {
    return getComments(req, res);
  } else if (req.method === "POST") {
    return createPostComment(req, res);
  } else {
    return res.status(405).json({ error: "Method ${req.method} allowed" });
  }
}
