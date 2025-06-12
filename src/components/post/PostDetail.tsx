import { useState, useEffect } from "react";
import { MessageCircleIcon, HeartIcon, ImagesIcon, EditIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
//import { getRandomColor } from "../../types/utils";
import useFetch from "../../hooks/useFetch";
import UserImg from "../../assets/user_icon.png";
import { LoadingDialog } from "../Dialog";

interface Comment {
  _id: string;
  user: {
    _id: string;
    displayName: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: string;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Ngày không hợp lệ';
  }
};

const PostDetail = ({ postId, onClose }: { postId: string | null; onClose?: () => void }) => {
  const { get, loading } = useFetch();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (postId) {
        try {
          // Fetch post details
          const postRes = await get(`/v1/post/get/${postId}`);
          if (postRes.result) {
            setPost(postRes.data);
          }

          // Fetch comments
          const commentsRes = await get(`/v1/comment/list`, {
            post: postId,
            isPaged: 0
          });
          if (commentsRes.result) {
            setComments(commentsRes.data.content || []);
          }
        } catch (error) {
          console.error('Error fetching post details:', error);
        }
      }
    };
    fetchData();
  }, [postId]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (post.imageUrls.length - 1) : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <LoadingDialog isVisible={true} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 text-center text-gray-500">
        Không tìm thấy thông tin bài viết
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Post Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.user?.avatarUrl || UserImg}
              alt={post.user?.displayName}
              className="w-12 h-12 rounded-full border border-gray-200"
            />
            <div>
              <h2 className="font-semibold text-lg">{post.user?.displayName}</h2>
              <p className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
                {post.isUpdated === 1 && (
                  <span className="ml-2 text-blue-500">
                    <EditIcon className="inline-block w-4 h-4 mr-1" />
                    Đã chỉnh sửa
                  </span>
                )}
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Post Images with Carousel */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-4 relative">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={post.imageUrls[currentImageIndex]}
                alt={`Post image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Navigation Buttons */}
              {post.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {post.imageUrls.length}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {post.imageUrls.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {post.imageUrls.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index 
                        ? 'border-blue-500' 
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center gap-4 text-gray-600 pt-4 border-t">
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="flex items-center gap-1">
              <ImagesIcon className="w-5 h-5 text-emerald-500" />
              <span>{post.imageUrls.length}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <HeartIcon className="w-5 h-5 text-rose-500" />
            <span>{post.totalReactions}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircleIcon className="w-5 h-5 text-indigo-500" />
            <span>{post.totalComments}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-4">Bình luận ({comments.length})</h3>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-3">
              <img
                src={comment.user.avatarUrl || UserImg}
                alt={comment.user.displayName}
                className="w-10 h-10 rounded-full border border-gray-200"
              />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{comment.user.displayName}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              Chưa có bình luận nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
