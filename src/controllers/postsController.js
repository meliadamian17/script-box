import prisma from "../utils/db";
import { paginate } from "../utils/pagination";
import { checkAuth } from "../utils/middleware";

export const getPost = checkAuth(async (req, res) => {
  const { id } = req.query;
  const post = await prisma.blogPost.findUnique({
    where: { id: parseInt(id) },
  });
  return res.status(200).json(post);
});

export const updatePost = checkAuth(async (req, res) => {
  const { title, description, content, tags } = req.body;
  const { id } = req.query;
  const userId = req.user?.userId;
  console.log(id);

  const post = await prisma.blogPost.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post does not exist" });
  }

  if (post.authorId !== userId) {
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this task." });
  }

  await prisma.blogPost.update({
    where: { id: parseInt(id) },
    data: {
      title,
      description,
      content,
      tags,
    },
  });

  return res.status(200).json({ message: "Post updated successfully" });
});

export const deletePost = checkAuth(async (req, res) => {
  const { id } = req.query;
  const userId = req.user?.userId;
  const post = await prisma.blogPost.findUnique({
    where: { id: parseInt(id) },
  });

  if (!post) {
    return res.status(404).json({ message: "Post does not exist" });
  }

  if (post.authorId !== userId) {
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this task." });
  }

  await prisma.blogPost.delete({
    where: {
      id: parseInt(id),
    },
  });

  return res.status(204).end();
});

export const getPosts = checkAuth(async (req, res) => {
  const { title, tags, content, page, limit, ownedByUser, sortBy } = req.query;
  const queryOptions = { where: {}, orderBy: {} };
  const userId = req.user?.userId;

  if (title) {
    queryOptions.where.title = { contains: title }; // Preserve original case
  }

  if (tags) {
    const tagsArray = tags.split(","); // Preserve original case
    queryOptions.where.tags = { hasSome: tagsArray };
  }

  if (content) {
    queryOptions.where.OR = [
      { description: { contains: content } },
      { content: { contains: content } },
    ];
  }

  if (ownedByUser === "true" && userId) {
    queryOptions.where.authorId = userId;
  }

  queryOptions.where.OR = [
    ...(queryOptions.where.OR || []),
    { hidden: false },
    { hidden: true, authorId: userId },
  ];

  if (sortBy) {
    if (sortBy === "reports") {
      if (req.user?.role !== "ADMIN") {
        return res
          .status(403)
          .json({ message: "Only ADMIN can filter by reports" });
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

  const { skip, take, paginationMeta } = paginate({ page, limit });

  try {
    const posts = await prisma.blogPost.findMany({
      ...queryOptions,
      skip,
      take,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    const totalItems = await prisma.blogPost.count({
      where: queryOptions.where,
    });
    const totalPages = Math.ceil(totalItems / paginationMeta.pageSize);

    res.status(200).json({
      posts,
      pagination: {
        ...paginationMeta,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to fetch posts | ${error.message}` });
  }
});

export const createPost = checkAuth(async (req, res) => {
  const { title, description, content, tags, rating, template } = req.body;
  const authorId = req.user?.userId;

  if (!title || !description || !content || !authorId) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        title,
        description,
        content,
        tags,
        rating,
        authorId,
        template,
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error creating post.", error: error.message });
  }
});
