import prisma from "../../../utils/db";
import { checkAuth } from "../../../utils/middleware";
import { IncomingForm } from "formidable";
import AWS from "aws-sdk";
import fs from "fs";
import { hashPassword } from "../../../utils/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  const userId = req.user?.userId;

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          profileImage: true,
          createdAt: true,
          updatedAt: true,
          templates: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(user);
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  } else if (req.method === "PATCH") {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: "Error parsing form data" });
      }

      const data = {};

      if (fields.firstName) data.firstName = fields.firstName[0];
      if (fields.lastName) data.lastName = fields.lastName[0];
      if (fields.phoneNumber) data.phoneNumber = fields.phoneNumber[0];
      if (fields.email) data.email = fields.email[0];

      if (fields.password) {
        const hashedPassword = hashPassword(fields.password);
        data.password = hashedPassword;
      }

      if (files.profileImage) {
        const profileImageFile = Array.isArray(files.profileImage)
          ? files.profileImage[0]
          : files.profileImage;
        try {
          const s3 = new AWS.S3();
          const fileContent = fs.readFileSync(profileImageFile.filepath);
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `profile-images/${userId}`,
            Body: fileContent,
            ContentType: files.profileImage.mimetype,
          };
          const uploadResult = await s3.upload(params).promise();
          data.profileImage = uploadResult.Location;
        } catch (uploadError) {
          return res.status(500).json({
            error: `Failed to upload image | ${uploadError} | ${profileImageFile.filepath}`,
          });
        }
      }

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data,
        });
        res
          .status(200)
          .json({ message: "Profile updated successfully", user: updatedUser });
      } catch (error) {
        res.status(400).json({ error: `Failed to update profile | ${error}` });
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default checkAuth(handler);
