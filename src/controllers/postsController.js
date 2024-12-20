import prisma from "../utils/db";
import { paginate } from "../utils/pagination";
import { checkAuth, optionalAuth } from "../utils/middleware";

export const getPost = optionalAuth(async (req, res) => {
  const { id } = req.query;
  const userId = req.user?.userId;
  const post = await prisma.blogPost.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      ratings: {
        select: {
          userId: true,
          value: true,
        },
      },
      templates: {
        select: {
          id: true,
          title: true,
          language: true,
          userId: true,
          code: true,
          description: true,
          tags: true,
        },
      },
    },
  });
  console.log(post);
  return res.status(200).json({ post, userId });
});

export const updatePost = checkAuth(async (req, res) => {
  const { title, description, content, tags, templates } = req.body;
  const { id } = req.query;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  const postId = parseInt(id);

  const post = await prisma.blogPost.findUnique({
    where: {
      id: postId,
    },
    include: {
      templates: true,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post does not exist" });
  }

  if (post.authorId !== userId && userRole !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this task." });
  }

  let tagsString = "";
  if (typeof tags === "string") {
    tagsString = tags;
  } else if (Array.isArray(tags)) {
    const uniqTags = [...new Set(tags)];
    tagsString = uniqTags.join(",");
  } else {
    tagsString = "";
  }

  let templateUpdates = {};

  if (Array.isArray(templates)) {
    const currentTemplateIds = post.templates.map((t) => t.id);

    const templatesToConnect = templates
      .filter((id) => !currentTemplateIds.includes(id))
      .map((id) => ({ id }));

    const templatesToDisconnect = currentTemplateIds
      .filter((id) => !templates.includes(id))
      .map((id) => ({ id }));

    templateUpdates = {
      connect: templatesToConnect,
      disconnect: templatesToDisconnect,
    };
  }

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      title,
      description,
      content,
      tags: tagsString,
      templates: templateUpdates,
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

export const getPosts = optionalAuth(async (req, res) => {
  const { title, tags, content, page, limit, ownedByUser, sortBy } = req.query;
  const queryOptions = { where: {}, orderBy: {} };
  const userId = req.user?.userId;

  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });
  }

  let userRole = "USER";
  if (user) {
    userRole = user.role;
  }

  if (title) {
    queryOptions.where.title = { contains: title };
  }

  if (tags) {
    const tagsArray = tags.split(",");
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

  if (userRole !== "ADMIN") {
    queryOptions.where.AND = [
      ...(queryOptions.where.AND || []),
      {
        OR: userId
          ? [{ hidden: false }, { hidden: true, authorId: userId }]
          : [{ hidden: false }],
      },
    ];
  }

  if (sortBy) {
    console.log(req.user);
    if (sortBy === "reports") {
      if (user.role !== "ADMIN") {
        return res
          .status(403)
          .json({ message: "Only ADMIN can filter by reports." });
      }
      queryOptions.orderBy = { reports: { _count: "desc" } };
    } else if (["asc", "desc"].includes(sortBy)) {
      queryOptions.orderBy = { rating: sortBy };
    } else {
      return res.status(400).json({
        message: "Invalid sortBy value. Use 'asc', 'desc', or 'reports'.",
      });
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
        ratings: {
          select: {
            userId: true,
            value: true,
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
      userId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to fetch posts | ${error.message}` });
  }
});

export const createPost = checkAuth(async (req, res) => {
  console.log("User:", req.user);
  console.log("Reached controller");
  const { title, description, content, tags, rating, templates } = req.body;
  const authorId = req.user?.userId;
  console.log(authorId);
  console.log("Incoming request body:", req.body);
  console.log("Templates:", templates);
  console.log("Post ID: ");
  if (!title || !description || !content || !authorId) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const tagsArray = Array.isArray(tags) ? tags : [];
    const uniqTags = [...new Set(tagsArray)];

    const tagsString = uniqTags.join(",");

    console.log("TRY");
    const post = await prisma.blogPost.create({
      data: {
        title,
        description,
        content,
        tags: tagsString,
        rating,
        authorId,
        templates: {
          connect: templates.map((id) => ({ id })),
        },
      },
      include: {
        templates: true,
      },
    });
    console.log("Post ID: ", post.id);

    return res.status(201).json(post);
  } catch (error) {
    console.log("catch");
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error creating post.", error: error.message });
  }
});
