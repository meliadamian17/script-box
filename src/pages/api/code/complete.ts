import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { checkAuth } from "@/utils/middleware";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function completion(
  prefix: string,
  suffix: string,
  model: string = "gpt-3.5-turbo-1106",
  language: string,
) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are the best and most skilled software engineer at Google and you are a ${
          language ? language + " " : ""
        }programmer that replaces <FILL_ME> part with the right code. Only output the code that replaces <FILL_ME> part. Do not add any explanation or markdown or the code formatting around the code.`,
      },
      { role: "user", content: `${prefix}<FILL_ME>${suffix}` },
    ],
    model,
  });

  return chatCompletion.choices[0].message.content;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { prefix, suffix, model, language } = req.body;
  const prediction = await completion(prefix, suffix, model, language);
  console.log(prediction);
  res.status(200).json({ prediction });
};

export default checkAuth(handler);
