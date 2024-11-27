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
    if (sortBy === "reports" && req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only ADMIN can filter by reports." });
    }

    if (sortBy === "reports") {
      queryOptions.orderBy = { reports: { _count: "desc" } };
    } else if (["asc", "desc"].includes(sortBy)) {
      queryOptions.orderBy = { rating: sortBy };
    } else {
      return res.status(400).json({
        message: "Invalid sortBy value. Use 'asc', 'desc', or 'reports'.",
      });
    }
  }

  queryOptions.where = {
    ...queryOptions.where,
    blogPostId: parseInt(postID),
    parentId: null, // Fetch only top-level comments
  };

  const { skip, take, paginationMeta } = paginate({ page, limit });

  const comments = await prisma.comment.findMany({
    ...queryOptions,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          ratings: true,
        },
        orderBy: { createdAt: "asc" },
      },
      ratings: true,
      _count: {
        select: {
          replies: true, // This will calculate the reply count
        },
      },
    },
    skip,
    take,
  });

  // Map the comments to include replyCount explicitly
  const formattedComments = comments.map((comment) => ({
    ...comment,
    replyCount: comment._count.replies, // Add replyCount as a top-level property
  }));

  const totalItems = await prisma.comment.count({
    where: queryOptions.where,
  });
  const totalPages = Math.ceil(totalItems / paginationMeta.pageSize);

  res.status(200).json({
    formattedComments,
    pagination: {
      ...paginationMeta,
      totalItems,
      totalPages,
    },
  });
});

export const createPostComment = checkAuth(async (req, res) => {
  const { content, blogPostId, parentId } = req.body;
  const userId = req.user?.userId;

  if (!content || (!blogPostId && !parentId)) {
    return res.status(400).json({
      message: "Content and either blogPostId or parentId are required.",
    });
  }

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
    });

    if (!parentComment) {
      return res
        .status(404)
        .json({ message: "Parent comment does not exist." });
    }
  } else {
    const postExists = await prisma.blogPost.findUnique({
      where: { id: parseInt(blogPostId) },
    });

    if (!postExists) {
      return res.status(404).json({ message: "Post does not exist." });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId,
      blogPostId: blogPostId ? parseInt(blogPostId) : null,
      parentId: parentId || null,
    },
  });

  res.status(201).json(comment);
});
