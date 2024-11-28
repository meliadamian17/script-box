import prisma from "../../../utils/db";
import { generateAccessToken, verifyRefreshToken } from "../../../utils/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ error: "Unauthorized, refresh token missing" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user.id);

    res.setHeader(
      "Set-Cookie",
      `accessToken=${newAccessToken}; HttpOnly; Path=/; Max-Age=3600`,
    );
    const email = user.email;
    const role = user.role;
    res
      .status(200)
      .json({ accessToken: newAccessToken, email: email, role: role });
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
}
