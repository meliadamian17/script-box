import { IncomingForm } from "formidable";
import prisma from "../../../utils/db";
import bcrypt from "bcryptjs";
import AWS from "aws-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(400).json({ error: "Error parsing form data" });
      }

      const firstName = String(fields.firstName || "");
      const lastName = String(fields.lastName || "");
      const email = String(fields.email || "");
      const password = String(fields.password || "");

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required" });
      }

      try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const defaultProfileImageUrl =
          process.env.DEFAULT_PROFILE_IMAGE_URL || "";
        let profileImageUrl = defaultProfileImageUrl;

        if (files.profileImage) {
          const profileImageFile = Array.isArray(files.profileImage)
            ? files.profileImage[0]
            : files.profileImage;

          try {
            const s3 = new AWS.S3();
            const fileContent = fs.readFileSync(profileImageFile.filepath);
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME || "",
              Key: `profile-images/${uuidv4()}`,
              Body: fileContent,
              ContentType: profileImageFile.mimetype || "",
            };
            const uploadResult = await s3.upload(params).promise();
            profileImageUrl = uploadResult.Location;
          } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            return res.status(500).json({ error: "Failed to upload image" });
          }
        }

        // Create user in the database
        const user = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profileImage: profileImageUrl,
          },
        });

        return res
          .status(201)
          .json({ message: "User created successfully", user });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return res.status(500).json({ error: "Failed to create user" });
      }
    });
  } catch (outerError) {
    console.error("Unhandled error:", outerError);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export default handler;
