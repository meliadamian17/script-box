import { createPost, getPosts } from "../../../controllers/postsController";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return getPosts(req, res);
  } else if (req.method === "POST") {
    return createPost(req, res);
  } else {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
