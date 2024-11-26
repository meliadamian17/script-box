// /pages/api/user/preferences.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/db";

import { checkAuth } from "../../../utils/middleware";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === "GET") {
    const userId = req.user?.userId; // Ensure your auth middleware sets the userId
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId },
      });
      res.status(200).json(preferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  } else if (method === "PATCH") {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { defaultLanguage, defaultTheme, enableVim, relativeLineNumbers } =
      req.body;

    try {
      const updatedPreferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          defaultLanguage,
          defaultTheme,
          enableVim,
          relativeLineNumbers,
        },
        create: {
          userId,
          defaultLanguage,
          defaultTheme,
          enableVim,
          relativeLineNumbers,
        },
      });
      res.status(200).json(updatedPreferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to update preferences" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default checkAuth(handler);
