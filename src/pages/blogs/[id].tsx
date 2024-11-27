import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PostDetails from "@/components/Blogs/PostDetails"
import CommentsSection from "@/components/Blogs/CommentsSection";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  hidden: boolean;
  reported: boolean;
  canEdit: boolean;

  author: User;
  authorId: number;
  comments: Comment[];
  reports: Report[];
  templates: Template[];
  ratings: BlogPostRating[];
}
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage?: string;
  phoneNumber?: string;
  role: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;

  templates: Template[];
  blogPosts: BlogPost[];
  comments: Comment[];
  reports: Report[];
  ratings: CommentRating[];
  postRatings: BlogPostRating[];
}
interface Template {
  id: number;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags: string;
  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: number;

  forkedFrom?: Template;
  forkedFromId?: number;
  forks: Template[];

  blogPosts: BlogPost[];
  comments: Comment[];
}
interface CommentRating {
  id: number;
  value: number;
  createdAt: Date;

  user: User;
  userId: number;

  comment: Comment;
  commentId: number;
}
interface BlogPostRating {
  id: number;
  value: number;
  createdAt: Date;
  updatedAt: Date;

  user: User;
  userId: number;

  post: BlogPost;
  postId: number;
}
interface Comment {
  id: number;
  content: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  hidden: boolean;
  reported: boolean;
  canEdit: boolean;
  user: User;
  userId: number;
  blogPost?: BlogPost | null;
  blogPostId?: number | null;
  template?: Template | null;
  templateId?: number | null;
  report?: Report | null;
  ratings: CommentRating[];
}

export default function Post() {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [userId, setUserId] = useState<number | null>(null);

  const postId = Number(router.query.id);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    const response = await fetch(`/api/posts/${postId}`);
    const data = await response.json();
    if (response.ok) {
      setPost(data.post);
      setUserId(data.userId);
    } else {
      console.error("Failed to fetch post");
    }
  };

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <h1 className="text-xl font-semibold text-gray-400">
          Loading blog post...
        </h1>
      </div>
    );
  }

  return (
    <div className="bg-base-100 py-8 px-4 min-h-screen">
      <PostDetails post={post} userId={userId} onVote={fetchPost} />

      <CommentsSection postId={postId} userId={userId} />
    </div>
  );
}
