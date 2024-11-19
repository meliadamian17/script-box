import { checkAuth } from "../../../utils/middleware";
import prisma from "../../../utils/db";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  //@ts-ignore
  const userId = req.user.userId;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    res.setHeader("Set-Cookie", [
      "accessToken=; HttpOnly; Path=/; Max-Age=0",
      "refreshToken=; HttpOnly; Path=/; Max-Age=0",
    ]);

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed to logout" });
  }
};

export default checkAuth(handler);
