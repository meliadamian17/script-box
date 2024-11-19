import prisma from "../utils/db";
import { paginate } from "../utils/pagination";
import { checkAuth } from "../utils/middleware";

export const updateComment = checkAuth(async (req, res) => {
  const { content, commentID } = req.body;
  const userId = req.user?.userId;

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentID,
    },
    select: {
      userId: true,
      hidden: true,
      canEdit: true,
    },
  });

  if (!comment) {
    return res.status(404).json({ message: "Comment does not exist." });
  }

  if (comment.userId !== userId || !comment.canEdit) {
    return res
      .status(403)
      .json({ message: "You are not authorized to edit this comment." });
  }

  await prisma.comment.update({
    where: { id: commentID },
    data: { content },
  });

  res.status(200).json({ message: "Comment updated successfully" });
});

export const deleteComment = checkAuth(async (req, res) => {
  const { id } = req.query;
  const userId = req.user?.userId;

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(id) },
    select: { userId: true },
  });

  if (!comment) {
    return res.status(404).json({ message: "Comment does not exist" });
  }

  if (comment.userId !== userId) {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this comment." });
  }

  await prisma.comment.delete({
    where: { id: parseInt(id) },
  });

  res.status(204).end();
});

export const getComments = checkAuth(async (req, res) => {
  const { sortBy, page, limit, postID } = req.query;
  const userId = req.user?.userId;
  const queryOptions = {
    where: {
      OR: [{ hidden: false }, { hidden: true, userId }],
    },
  };

  if (sortBy) {
    console.log(req.user);
    if (sortBy == "reports") {
      if (req.user?.role !== "ADMIN") {
        return res
          .status(403)
          .json({ message: "Can Only Filter By Reports if ADMIN" });
      }
      queryOptions.orderBy = {
        reports: {
          _count: "desc",
        },
      };
    } else {
      queryOptions.orderBy.rating = sortBy;
    }
  }

  queryOptions.where = {
    ...queryOptions.where,
    blogPostId: parseInt(postID),
  };

  const { skip, take, paginationMeta } = paginate({ page, limit });

  const comments = await prisma.comment.findMany({
    ...queryOptions,
    skip,
    take,
  });

  const totalItems = await prisma.comment.count({
    where: queryOptions.where,
  });
  const totalPages = Math.ceil(totalItems / paginationMeta.pageSize);

  res.status(200).json({
    comments,
    pagination: {
      ...paginationMeta,
      totalItems,
      totalPages,
    },
  });
});

export const createPostComment = checkAuth(async (req, res) => {
  const { content, postID } = req.body;
  const userId = req.user?.userId;

  const postExists = await prisma.blogPost.findUnique({
    where: { id: parseInt(postID) },
  });

  if (!postExists) {
    return res.status(404).json({ message: "Post does not exist." });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId,
      blogPostId: parseInt(postID),
    },
  });

  res.status(201).json(comment);
});
