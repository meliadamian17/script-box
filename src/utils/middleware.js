import { verifyAccessToken } from "./auth";

export const checkAuth = (handler) => async (req, res) => {
  try {
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res
        .status(401)
        .json({ error: "Unauthorized, access token missing" });
    }

    const decoded = verifyAccessToken(accessToken);
    req.user = decoded;

    return handler(req, res);
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};
