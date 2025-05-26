import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "../Dialog";
import { toast } from "react-toastify";
import {
  CircleCheckBigIcon,
  ClockIcon,
  EarthIcon,
  UsersIcon,
  MessageSquareIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
} from "lucide-react";
import userImg from "../../assets/user_icon.png";

const PageDetail = ({ pageId, onBack }: any) => {
  const [page, setPage] = useState<any>(null);
  const { get, loading } = useFetch();

  useEffect(() => {
    const fetchPageDetail = async () => {
      try {
        const res = await get(`/v1/page/${pageId}`);
        if (res.result) {
          setPage(res.data);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải thông tin trang");
      }
    };
    fetchPageDetail();
  }, [pageId]);

  if (!page) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={page.avatarUrl || userImg}
            alt="Page Avatar"
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{page.name}</h1>
            <p className="text-gray-600">{page.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-md ${
              page.status === 1
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {page.status === 1 ? (
              <>
                <ClockIcon size={16} />
                Chưa kích hoạt
              </>
            ) : (
              <>
                <CircleCheckBigIcon size={16} />
                Đã kích hoạt
              </>
            )}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-md ${
              page.kind === 1
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {page.kind === 1 ? (
              <>
                <EarthIcon size={16} />
                Công khai
              </>
            ) : (
              <>
                <UsersIcon size={16} />
                Chỉ người theo dõi
              </>
            )}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UsersIcon className="text-emerald-500" size={20} />
              <span className="text-gray-600">Thành viên</span>
            </div>
            <span className="text-xl font-semibold">{page.totalMembers || 0}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquareIcon className="text-indigo-500" size={20} />
              <span className="text-gray-600">Bài đăng</span>
            </div>
            <span className="text-xl font-semibold">{page.totalPosts || 0}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="text-blue-500" size={20} />
              <span className="text-gray-600">Ngày tạo</span>
            </div>
            <span className="text-xl font-semibold">
              {new Date(page.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-4">Thông tin chi tiết</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="text-gray-500" size={16} />
                <span className="text-gray-600">Người tạo:</span>
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src={page.creator?.avatarUrl || userImg}
                  alt="Creator Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span>{page.creator?.displayName}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <ShieldCheckIcon className="text-gray-500" size={16} />
                <span className="text-gray-600">Danh mục:</span>
              </div>
              <span>{page.category}</span>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        {page.recentPosts && page.recentPosts.length > 0 && (
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-4">Bài đăng gần đây</h2>
            <div className="space-y-4">
              {page.recentPosts.map((post: any) => (
                <div key={post._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={post.user?.avatarUrl || userImg}
                        alt="User Avatar"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">{post.user?.displayName}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{post.content}</p>
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="mt-2 flex space-x-2">
                      {post.imageUrls.map((url: string, index: number) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Post image ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={onBack}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Quay lại
        </button>
      </div>

      <LoadingDialog isVisible={loading} />
    </div>
  );
};

export default PageDetail; 