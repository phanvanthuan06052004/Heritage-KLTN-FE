import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "~/components/common/ui/Button";
import { toast } from "react-toastify";
import { selectCurrentUser } from "~/store/slices/authSlice";
import { Comment } from "~/components/common/ui/Comment";
import {
  useCreateDiscussMutation,
  useGetDiscussByParentIdQuery,
} from "~/store/apis/disscussSlice";

const DiscussionSection = ({ heritageId }) => {
  const currentUser = useSelector(selectCurrentUser);
  const [newComment, setNewComment] = useState("");

  const {
    data: topLevelComments,
    isLoading: isLoadingComments,
    error: commentsError,
  } = useGetDiscussByParentIdQuery({
    heritageId,
    parentId: null,
  });

  const [createComment, { isLoading: isCreating }] = useCreateDiscussMutation();

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please login to comment.");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      await createComment({
        heritageId,
        content: newComment,
        userId: currentUser._id,
        parentId: null,
      }).unwrap();
      toast.success("Comment posted!");
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Unable to post comment. Please try again.");
    }
  };

  return (
    <div className=" mx-auto py-8">
      <h2 className="mb-4 flex items-center font-display text-2xl font-semibold text-museum-gold-light">
        <MessageSquare className="w-5 h-5 mr-2" />
        Q&A
      </h2>
      <div className="museum-card rounded-[2rem] p-6 text-museum-ivory">
        {/* Comments List */}
        {isLoadingComments ? (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-museum-gold-light" />
          </div>
        ) : commentsError ? (
          <p className="text-center text-museum-muted">
            Unable to load comments. Please try again.
          </p>
        ) : !topLevelComments ||
          !topLevelComments.discussArray ||
          topLevelComments.discussArray.length === 0 ? (
          <p className="mb-6 text-center text-museum-muted">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {topLevelComments?.discussArray?.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                heritageId={heritageId}
                currentUser={currentUser}
                avatar={comment?.user?.avatar}
              />
            ))}
          </div>
        )}

        {/* Comment Form */}
        <form
          onSubmit={handleCommentSubmit}
          className="mt-5 flex flex-col items-end"
        >
          <textarea
            className="min-h-28 w-full rounded-2xl border border-museum-gold/20 bg-museum-ivory px-4 py-3 text-sm text-museum-black placeholder:text-museum-muted focus:outline-none focus:ring-2 focus:ring-museum-gold-light"
            placeholder={
              currentUser
                ? "Share your thoughts..."
                : "Please login to comment."
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!currentUser || isCreating}
          />
          <Button
            type="submit"
            className="mt-3 rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light"
            disabled={!currentUser || isCreating}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Send className="w-4 h-4 mr-1" />
            )}
            Post Comment
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DiscussionSection;
