import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog } from "../Dialog";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  UsersIcon,
  MessageSquareIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  CircleCheckBigIcon,
} from "lucide-react";
import userImg from "../../assets/user_icon.png";

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

interface GroupData {
  _id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  coverUrl?: string;
  status: number;
  kind: number;
  isAutoModerationEnabled: boolean;
  totalMembers: number;
  totalPosts: number;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  recentPosts: Array<{
    _id: string;
    content: string;
    createdAt: string;
    createdBy: {
      _id: string;
      name: string;
      avatarUrl?: string;
    };
  }>;
}

const GroupDetail = ({ groupId, onBack }: GroupDetailProps) => {
  const [group, setGroup] = useState<GroupData | null>(null);
  const { get, loading } = useFetch();

  useEffect(() => {
    const fetchGroupDetail = async () => {
      try {
        const res = await get(`/v1/group/${groupId}`);
        if (res.result) {
          setGroup(res.data);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải thông tin nhóm");
      }
    };

    fetchGroupDetail();
  }, [groupId]);

  if (!group) {
    return null;
  }

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeftIcon size={20} />
        <span>Quay lại</span>
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-start gap-6">
          <img
            src={group.avatarUrl || userImg}
            alt="Group Avatar"
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
            <p className="mt-2 text-gray-600">{group.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  group.status === 1
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {group.status === 1 ? (
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
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  group.isAutoModerationEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <ShieldCheckIcon size={16} />
                {group.isAutoModerationEnabled ? "Đang bật duyệt tự động" : "Đang tắt duyệt tự động"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <UsersIcon size={20} />
              <span className="font-medium">Thành viên</span>
            </div>
            <p className="text-2xl font-semibold mt-2">{group.totalMembers}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MessageSquareIcon size={20} />
              <span className="font-medium">Bài đăng</span>
            </div>
            <p className="text-2xl font-semibold mt-2">{group.totalPosts}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon size={20} />
              <span className="font-medium">Ngày tạo</span>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {new Date(group.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Creator Info */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Người tạo nhóm</h2>
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
            <img
              src={group.createdBy.avatarUrl || userImg}
              alt="Creator Avatar"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{group.createdBy.name}</p>
              <p className="text-sm text-gray-600">ID: {group.createdBy._id}</p>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        {group.recentPosts && group.recentPosts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bài đăng gần đây</h2>
            <div className="space-y-4">
              {group.recentPosts.map((post) => (
                <div key={post._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.createdBy.avatarUrl || userImg}
                      alt="Post Creator Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{post.createdBy.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LoadingDialog isVisible={loading} />
    </div>
  );
};

export default GroupDetail; 