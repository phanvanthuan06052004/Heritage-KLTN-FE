import React, { useState } from "react";
import {
  Loader2,
  Send,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { Button } from "./Button";
import { toast } from "react-toastify";
import {
  useCreateDiscussMutation,
  useDeleteDiscussMutation,
  useGetDiscussByParentIdQuery,
} from "~/store/apis/disscussSlice";
import { Avatar } from "./Avatar";

const Comment = ({ comment, depth = 0, heritageId, currentUser, avatar }) => {
  const [replyForm, setReplyForm] = useState({ content: "", isOpen: false });
  const [showReplies, setShowReplies] = useState(false);

  const isOwnComment = currentUser?._id === comment.userId.toString();
  const hasReplies =
    comment.comment_right - comment.comment_left > 1 || showReplies;

  const { data: repliesData = { comments: [] }, isLoading: isLoadingReplies } =
    useGetDiscussByParentIdQuery(
      { heritageId, parentId: comment._id },
      { skip: !showReplies },
    );

  const [createComment, { isLoading: isCreating }] = useCreateDiscussMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteDiscussMutation();

  const toggleReplyForm = () => {
    setReplyForm((prev) => ({
      content: prev.isOpen ? "" : prev.content,
      isOpen: !prev.isOpen,
    }));
  };

  const handleReplyChange = (e) => {
    setReplyForm((prev) => ({ ...prev, content: e.target.value }));
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please login to comment.");
      return;
    }
    if (!replyForm.content.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      await createComment({
        heritageId,
        content: replyForm.content,
        parentId: comment._id,
      }).unwrap();
      toast.success("Reply posted!");
      setReplyForm({ content: "", isOpen: false });
      setShowReplies(true);
    } catch (err) {
      console.error("Failed to post reply:", err);
      toast.error("Unable to post reply. Please try again.");
    }
  };

  const handleDeleteComment = async () => {
    try {
      await deleteComment({
        heritageId: heritageId,
        commentId: comment._id,
      }).unwrap();
      toast.success("Comment deleted!");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Unable to delete comment. Please try again.");
    }
  };

  const toggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  return (
    <div
      className={`mt-4 ${depth > 0 ? "ml-4 sm:ml-6 border-l-2 border-border pl-3 sm:pl-4" : ""}`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={comment.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[color:var(--heritage-light)] flex items-center justify-center text-[color:var(--heritage-dark)] text-sm font-medium">
              {comment.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm text-foreground truncate">
              {comment.username}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[color:var(--muted-foreground)]">
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleDateString("vi-VN")
                  : ""}
              </span>
              {isOwnComment && (
                <button
                  onClick={handleDeleteComment}
                  className="text-xs text-[color:var(--destructive)] hover:text-[color:var(--destructive)]/80 transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={toggleReplyForm}
              className="text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--heritage-primary)] transition-colors"
              aria-label={
                replyForm.isOpen ? "Cancel reply" : "Reply to comment"
              }
            >
              {replyForm.isOpen ? "Hủy" : "Trả lời"}
            </button>

            {hasReplies && (
              <button
                onClick={toggleReplies}
                className="text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--heritage-primary)] transition-colors flex items-center gap-1"
                aria-label={showReplies ? "Hide replies" : "Show replies"}
              >
                {showReplies ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {showReplies ? "Ẩn trả lời" : "Hiện trả lời"}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyForm.isOpen && (
            <form
              onSubmit={handleReplySubmit}
              className="mt-3 animate-slide-down"
            >
              <textarea
                className="w-full rounded-md border border-[color:var(--input)] bg-[color:var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--heritage-primary)] resize-none"
                rows="3"
                placeholder="Write your reply..."
                value={replyForm.content}
                onChange={handleReplyChange}
                disabled={isCreating}
                aria-label="Reply content"
              />
              <div className="mt-2 flex space-x-2">
                <Button type="submit" size="sm" isLoading={isCreating}>
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Post reply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleReplyForm}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="mt-2 animate-fade-in">
          {isLoadingReplies ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-[color:var(--heritage-primary)]" />
            </div>
          ) : repliesData?.discussArray?.length === 0 ? (
            <p className="ml-14 text-sm text-[color:var(--muted-foreground)] py-2">
              <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
              No replies yet.
            </p>
          ) : (
            repliesData?.discussArray?.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                depth={depth + 1}
                heritageId={heritageId}
                currentUser={currentUser}
                avatar={avatar}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;
