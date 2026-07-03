import React, { useState } from "react";
import PropTypes from "prop-types";
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

  const isOwnComment = currentUser?._id === comment.userId?.toString();
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
        userId: currentUser._id,
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

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
      ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className={depth > 0 ? "mt-2.5" : "mt-0"}>
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={comment.username}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-museum-gold/25"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-museum-gold/20 text-sm font-semibold text-museum-gold-light">
              {comment.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Bong bóng: tên + nội dung */}
          <div className="group flex items-start gap-1">
            <div className="w-fit max-w-full rounded-2xl rounded-tl-md border border-museum-gold/12 bg-museum-black/55 px-3.5 py-2">
              <span className="block font-display text-[13px] font-semibold text-museum-ivory">
                {comment.username}
              </span>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-museum-parchment">
                {comment.content}
              </p>
            </div>
            {isOwnComment && (
              <button
                onClick={handleDeleteComment}
                className="mt-1 shrink-0 rounded-full p-1 text-museum-muted opacity-0 transition-all hover:bg-museum-seal/12 hover:text-museum-seal group-hover:opacity-100 disabled:opacity-50"
                disabled={isDeleting}
                aria-label="Xoá bình luận"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Hàng hành động kiểu Facebook */}
          <div className="ml-3 mt-1 flex items-center gap-3 text-xs">
            <button
              onClick={toggleReplyForm}
              className="font-semibold text-museum-muted transition-colors hover:text-museum-gold-light"
            >
              {replyForm.isOpen ? "Hủy" : "Trả lời"}
            </button>
            <span className="text-museum-muted/70">{formatTime(comment.createdAt)}</span>
            {hasReplies && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-0.5 font-semibold text-museum-muted transition-colors hover:text-museum-gold-light"
              >
                {showReplies ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {showReplies ? "Ẩn trả lời" : "Hiện trả lời"}
              </button>
            )}
          </div>

          {/* Form trả lời */}
          {replyForm.isOpen && (
            <form onSubmit={handleReplySubmit} className="mt-2 animate-fade-in">
              <textarea
                className="w-full resize-none rounded-xl border border-museum-gold/20 bg-museum-ivory px-3 py-2 text-sm text-museum-black placeholder:text-museum-muted focus:outline-none focus:ring-2 focus:ring-museum-gold-light"
                rows="2"
                placeholder="Viết câu trả lời…"
                value={replyForm.content}
                onChange={handleReplyChange}
                disabled={isCreating}
                aria-label="Nội dung trả lời"
              />
              <div className="mt-2 flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isCreating}
                  className="rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light"
                >
                  <Send className="mr-1 h-3.5 w-3.5" />
                  Gửi
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleReplyForm}
                  className="rounded-full text-museum-muted hover:text-museum-parchment"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          )}

          {/* Replies (lồng nhau, có vạch dẫn bên trái) */}
          {showReplies && (
            <div className="mt-1 border-l-2 border-museum-gold/12 pl-3 animate-fade-in">
              {isLoadingReplies ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-museum-gold-light" />
                </div>
              ) : !repliesData?.discussArray?.length ? (
                <p className="py-2 text-xs text-museum-muted">
                  <MessageSquare className="mr-1 inline h-3.5 w-3.5" />
                  Chưa có trả lời.
                </p>
              ) : (
                repliesData.discussArray.map((reply) => (
                  <Comment
                    key={reply._id}
                    comment={reply}
                    depth={depth + 1}
                    heritageId={heritageId}
                    currentUser={currentUser}
                    avatar={reply?.user?.avatar}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Comment.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string,
    userId: PropTypes.object,
    username: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    comment_left: PropTypes.number,
    comment_right: PropTypes.number,
  }).isRequired,
  depth: PropTypes.number,
  heritageId: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    _id: PropTypes.string,
  }),
  avatar: PropTypes.string,
};

export { Comment };
