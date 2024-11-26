import prisma from "../../../utils/db";
import { checkAuth } from "../../../utils/middleware";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = req.user?.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ profileImage: user.profileImage });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch profile image | ${error}` });
  }
};

export default checkAuth(handler);
