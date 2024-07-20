import { FaRegComment, FaRegHeart, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegBookmark } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { toast } from "react-hot-toast";
import { formatPostDate } from "../../utils/date/index.js";

export default function Post({ post }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isMyPost = authUser && authUser._id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt); 

  
  const isLiked = Array.isArray(post.likes) && post.likes.includes(authUser._id);

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Couldn't delete post");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/like/${post._id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Error liking/unliking post");
      return res.json();
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["posts"], (oldData) =>
        oldData.map((p) =>
          p._id === post._id ? { ...p, likes: updatedLikes } : p
        )
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async (text) => {
      try {
        const res = await fetch(`api/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error posting comment");
        return data;
      } catch (error) {
        console.error(error.message);
      }
    },
    onSuccess: (updatedComments) => {
      toast.success("Comment Added");
      setText("");
      queryClient.invalidateQueries({queryKey : ["posts"]})
    },
  });

  const handleDeletePost = () => {
    deletePostMutation.mutate();
  };

  const handleLikePost = () => {
    if (likePostMutation.isLoading) return;
    likePostMutation.mutate();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    commentPost(text);
  };

  // Log post.comments to understand its structure
  console.log("post.comments:", post.comments);

  // Ensure post.comments is an array
  const comments = post.comments;
  console.log(comments)
  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <div className="avatar">
        <Link to={`/profile/${post.user.username}`} className="w-8 rounded-full overflow-hidden">
          <img src={post.user.profileImg || "/avatar-placeholder.png"} alt="avatar" />
        </Link>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${post.user.username}`} className="font-bold">
            {post.user.fullName}
          </Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${post.user.username}`}>@{post.user.username}</Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              <FaTrash className="cursor-pointer hover:text-red-500" onClick={handleDeletePost} />
              {deletePostMutation.isLoading && <LoadingSpinner />}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post.text}</span>
          {post.img && (
            <img
              src={post.img}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt=""
            />
          )}
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">
            <div
              className="flex gap-1 items-center cursor-pointer group"
              onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
            >
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">
                {comments.length}
              </span>
            </div>
            <dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
              <div className="modal-box rounded border border-gray-600">
                <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                  {comments.length === 0 && (
                    <p className="text-sm text-slate-500">No comments yet 🤔 Be the first one 😉</p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-2 items-start">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img src={comment.user.profileImg || "/avatar-placeholder.png"} alt="avatar" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{comment.user.fullName}</span>
                          <span className="text-gray-700 text-sm">@{comment.user.username}</span>
                        </div>
                        <div className="text-sm">{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2" onSubmit={handlePostComment}>
                  <textarea
                    className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
                    placeholder="Add a comment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                    {isCommenting ? (
                      <span className="loading loading-spinner loading-md"></span>
                    ) : (
                      "Post"
                    )}
                  </button>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button className="outline-none">close</button>
              </form>
            </dialog>
            <div className="flex gap-1 items-center group cursor-pointer">
              <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
              <span className="text-sm text-slate-500 group-hover:text-green-500">0</span>
            </div>
            <div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
              {likePostMutation.isLoading && <LoadingSpinner />}
              {!isLiked && !likePostMutation.isLoading && (
                <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
              )}
              {isLiked && !likePostMutation.isLoading && (
                <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500" />
              )}
              <span className={`text-sm group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"}`}>
                {post.likes.length}
              </span>
            </div>
          </div>
          <div className="flex w-1/3 justify-end gap-2 items-center">
            <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
