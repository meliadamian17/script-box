import prisma from "../utils/db";
import { checkAuth } from "../utils/middleware";

export const ratePost = checkAuth(async (req, res) => {
  const userId = req.user?.userId;
  const { vote, postID } = req.body;

  const post = await prisma.blogPost.findUnique({
    where: { id: parseInt(postID) },
  });

  if (!post) {
    return res.status(404).json({ message: "Post does not exist" });
  }

  const ratingExists = await prisma.blogPostRating.findUnique({
    where: {
      userId_postId: { postId: parseInt(postID), userId: parseInt(userId) },
    },
  });

  if (ratingExists) {
    //if (parseInt(vote) <= -1 || parseInt(vote) >= 1) {
    //  return res
    //    .status(400)
    //    .json({ message: "Can only cast votes of abs(val) = 1" });
    //}
    await prisma.blogPost.update({
      where: { id: parseInt(postID) },
      data: {
        rating: { increment: vote - ratingExists.value },
      },
    });
  } else {
    await prisma.blogPost.update({
      where: { id: parseInt(postID) },
      data: { rating: { increment: parseInt(vote) } },
    });
  }

  res.status(200).json({ message: "Post rating updated successfully" });
});

export const rateComment = checkAuth(async (req, res) => {
  const userId = req.user?.userId;
  const { vote, commentID } = req.body;

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentID) },
  });

  if (!comment) {
    return res.status(404).json({ message: "Comment does not exist" });
  }

  const ratingExists = await prisma.commentRating.findUnique({
    where: {
      userId_commentId: {
        commentId: parseInt(commentID),
        userId: parseInt(userId),
      },
    },
  });

  if (ratingExists) {
    await prisma.comment.update({
      where: { id: parseInt(commentID) },
      data: {
        rating: { increment: parseInt(vote) - ratingExists.value },
      },
    });
  } else {
    await prisma.comment.update({
      where: { id: parseInt(commentID) },
      data: { rating: { increment: parseInt(vote) } },
    });
  }

  res.status(200).json({ message: "Comment rating updated successfully" });
});
