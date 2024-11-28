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

export const optionalAuth = (handler) => async (req, res) => {
  const accessToken =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      req.user = decoded;
    } catch (error) {
      // If token is invalid, proceed without attaching user info
      console.warn("Invalid access token:", error.message);
    }
  }

  return handler(req, res);
};
