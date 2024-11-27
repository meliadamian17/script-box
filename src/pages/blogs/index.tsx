import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "tailwindcss/tailwind.css";

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

export default function Posts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [userId, setUserId] = useState();
  const fetchPosts = async () => {
    const response = await fetch("../api/posts/posts");
    const data = await response.json();
    setPosts(data.posts);
    setUserId(data.userId)
  };
  const router = useRouter();
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const handleEdit = (postId: number) => {
    router.push(`blogs//edit/${postId}`);
  };

  const handlePostUpvote = async (postId: number) => {
    try {
      const response = await fetch(`../api/posts/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          'postID':postId, 
          'vote': 1, 
        }),
      });
  
      if (response.ok) {
        await fetchPosts();
      } else {
        console.error("Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting post", error);
    }
  };

  const handlePostDownvote = async (postId: number) => {
    try {
      const response = await fetch(`../api/posts/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          'postID':postId, 
          'vote': -1, 
        }),
      });
  
      if (response.ok) {
        await fetchPosts();
      } else {
        console.error("Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting post", error);
    }
  };
  const deletePost = async (id: number) => {
    const response = await fetch(`../api/posts/${id}`, {
      method: 'DELETE',
    });
    fetchPosts();
    
  };

  const toggleMenu = (postId: number) => {
    setMenuOpen((prev) => (prev === postId ? null : postId)); 
  };
  
  return (
    <div id="blogs_page" className="p-8 bg-base-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <a href="../blogs/create">
          <button className="btn btn-primary">New Post</button>
        </a>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            
            className="relative flex p-6 bg-base-200 rounded-lg shadow-md hover:shadow-xl transition"
          >

           
            <div className="absolute top-4 right-4">
              <button
                className="btn btn-circle btn-sm"
                onClick={() => toggleMenu(post.id)}
              >
                ⋮
              </button>
              {menuOpen === post.id && (

              
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                  {post.authorId === userId && (
                    <div className = "owner-rights" >
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleEdit(post.id)} 
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                        onClick={() => confirm("Are you sure you want to delete this post?") && deletePost(post.id)} 
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  <button
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                    onClick={() => console.log('report')} 
                  >
                    Report
                  </button>
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <div className="flex flex-col items-center space-y-2">
                <button 
                className="btn btn-sm btn-outline btn-success"
                onClick={() => handlePostUpvote(post.id)}
                >
                  ▲
                </button>
                <p className="font-semibold text-xl">{post.rating}</p>
                <button 
                className="btn btn-sm btn-outline btn-error"
                onClick={() => handlePostDownvote(post.id)}>
                  ▼
                </button>
              </div>
            </div>

            <div className="flex-grow pl-6">
              <h2 className="text-2xl font-semibold">
                <a href={`../blogs/${post.id}`} >
                  {post.title}
                </a>
              </h2>
              <p className="text-gray-600 mb-4">{post.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="badge badge-primary badge-outline text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-500">
                By: {post.author.firstName} {post.author.lastName}
              </p>
              <p className="text-sm text-gray-400">
                Published: {new Date(post.createdAt).toLocaleDateString()}
              </p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
