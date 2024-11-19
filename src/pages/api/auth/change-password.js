import prisma from "../../../utils/db";
import { checkAuth } from "../../../utils/middleware";
import { verifyPassword, hashPassword } from "../../../utils/auth";

const handler = async (req, res) => {
  const userId = req.user?.userId;

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Both current and new passwords are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      return res.status(403).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
};

export default checkAuth(handler);
