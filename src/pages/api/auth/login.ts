import prisma from "../../../utils/db";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyPassword,
} from "../../../utils/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.setHeader("Set-Cookie", [
      `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=3600`,
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800`,
    ]);

    const role = user.role;

    res
      .status(200)
      .json({ message: "Login successful", accessToken, refreshToken, role });
  } catch (error) {
    res.status(500).json({ error: `Login failed: ${error}` });
  }
}
