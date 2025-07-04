import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { LoadingDialog, ConfimationDialog } from "../Dialog";
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
  TrashIcon,
  PowerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import userImg from "../../assets/user_icon.png";
import useDialog from "../../hooks/useDialog";

interface PageMember {
  _id: string;
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  role: number;
  createdAt: string;
}

interface PagePost {
  _id: string;
  content: string;
  imageUrls?: string[];
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  status: number;
  createdAt: string;
}

const PageDetail = ({
  pageId,
  onBack,
}: {
  pageId: string;
  onBack: () => void;
}) => {
  const [page, setPage] = useState<any>(null);
  const [members, setMembers] = useState<PageMember[]>([]);
  const [posts, setPosts] = useState<PagePost[]>([]);
  const [currentMemberPage, setCurrentMemberPage] = useState(0);
  const [currentPostPage, setCurrentPostPage] = useState(0);
  const [totalMemberPages, setTotalMemberPages] = useState(0);
  const [totalPostPages, setTotalPostPages] = useState(0);
  const { get, put, del, loading } = useFetch();
  const { isDialogVisible, hideDialog, showDialog } = useDialog();
  const itemsPerPage = 5;

  // Fetch page details
  useEffect(() => {
    const fetchPageDetail = async () => {
      try {
        const res = await get(`/v1/page/get/${pageId}`);
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

  // Fetch page members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await get(`/v1/page-member/members/${pageId}`, {
          page: currentMemberPage,
          size: itemsPerPage,
        });
        if (res.result) {
          setMembers(res.data.content);
          setTotalMemberPages(res.data.totalPages);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải danh sách thành viên");
      }
    };
    if (pageId) {
      fetchMembers();
    }
  }, [pageId, currentMemberPage]);

  // Fetch page posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await get(`/v1/page-post/list`, {
          pageId,
          page: currentPostPage,
          size: itemsPerPage,
        });
        if (res.result) {
          setPosts(res.data.content);
          setTotalPostPages(res.data.totalPages);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải danh sách bài đăng");
      }
    };
    if (pageId) {
      fetchPosts();
    }
  }, [pageId, currentPostPage]);

  const handleChangeStatus = async (newStatus: number) => {
    try {
      const res = await put(`/v1/page/change-state`, {
        id: pageId,
        status: newStatus,
      });
      if (res.result) {
        toast.success(
          newStatus === 1 ? "Đã kích hoạt trang" : "Đã vô hiệu hóa trang"
        );
        setPage({ ...page, status: newStatus });
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await del(`/v1/page/delete/${pageId}`);
      if (res.result) {
        toast.success("Xóa trang thành công");
        onBack();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa trang");
    }
    hideDialog();
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: number) => {
    try {
      const res = await put(`/v1/page-member/update-role`, {
        pageMemberId: memberId,
        role: newRole,
      });
      if (res.result) {
        toast.success("Cập nhật vai trò thành công");
        // Refresh members list
        const updatedMembers = members.map((member) =>
          member._id === memberId ? { ...member, role: newRole } : member
        );
        setMembers(updatedMembers);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật vai trò");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await del(`/v1/page-member/remove/${memberId}`);
      if (res.result) {
        toast.success("Xóa thành viên thành công");
        setMembers(members.filter((member) => member._id !== memberId));
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa thành viên");
    }
  };

  const handleChangePostStatus = async (postId: string, newStatus: number) => {
    try {
      const res = await put(`/v1/page-post/change-state`, {
        id: postId,
        status: newStatus,
      });
      if (res.result) {
        toast.success(
          newStatus === 2 ? "Đã duyệt bài đăng" : "Đã từ chối bài đăng"
        );
        // Update post status in the list
        setPosts(
          posts.map((post) =>
            post._id === postId ? { ...post, status: newStatus } : post
          )
        );
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái bài đăng");
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await del(`/v1/page-post/delete/${postId}`);
      if (res.result) {
        toast.success("Xóa bài đăng thành công");
        setPosts(posts.filter((post) => post._id !== postId));
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài đăng");
    }
  };

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
          <button
            onClick={() => handleChangeStatus(page.status === 1 ? 2 : 1)}
            className={`p-2 rounded-lg transition-colors ${
              page.status === 1
                ? "text-yellow-600 hover:bg-yellow-50"
                : "text-green-600 hover:bg-green-50"
            }`}
            title={page.status === 1 ? "Vô hiệu hóa trang" : "Kích hoạt trang"}
          >
            <PowerIcon size={20} />
          </button>
          <button
            onClick={() => {
              showDialog();
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa trang"
          >
            <TrashIcon size={20} />
          </button>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-md ${
              page.status === 1
                ? "bg-green-100 text-green-800"
                : page.status === 2
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {page.status === 1 ? (
              <>
                <CircleCheckBigIcon size={16} />
                Đã kích hoạt
              </>
            ) : page.status === 2 ? (
              <>
                <ClockIcon size={16} />
                Chưa kích hoạt
              </>
            ) : (
              <>
                <TrashIcon size={16} />
                Đã xóa
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
            <span className="text-xl font-semibold">
              {page.totalMembers || 0}
            </span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquareIcon className="text-indigo-500" size={20} />
              <span className="text-gray-600">Bài đăng</span>
            </div>
            <span className="text-xl font-semibold">
              {page.totalPosts || 0}
            </span>
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
      <div className="border-t pt-4 mb-6">
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

      {/* Members List */}
      <div className="border-t pt-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Danh sách thành viên</h2>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={member.user.avatarUrl || userImg}
                    alt="Member Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{member.user.displayName}</div>
                    <div className="text-sm text-gray-500">
                      @{member.user.username}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleUpdateMemberRole(member._id, Number(e.target.value))
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={1}>Thành viên</option>
                    <option value={2}>Moderator</option>
                    <option value={3}>Admin</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Xóa thành viên"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination for members */}
        {totalMemberPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() =>
                setCurrentMemberPage((prev) => Math.max(0, prev - 1))
              }
              disabled={currentMemberPage === 0}
              className="p-2 rounded-lg bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <span className="py-2">
              Trang {currentMemberPage + 1} / {totalMemberPages}
            </span>
            <button
              onClick={() =>
                setCurrentMemberPage((prev) =>
                  Math.min(totalMemberPages - 1, prev + 1)
                )
              }
              disabled={currentMemberPage === totalMemberPages - 1}
              className="p-2 rounded-lg bg-gray-100 disabled:opacity-50"
            >
              <ChevronRightIcon size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="border-t pt-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Bài đăng gần đây</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={post.user.avatarUrl || userImg}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{post.user.displayName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {post.status === 1 && (
                    <>
                      <button
                        onClick={() => handleChangePostStatus(post._id, 2)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Duyệt bài đăng"
                      >
                        <CircleCheckBigIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleChangePostStatus(post._id, 3)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Từ chối bài đăng"
                      >
                        <ClockIcon size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Xóa bài đăng"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{post.content}</p>
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
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm ${
                    post.status === 1
                      ? "bg-yellow-100 text-yellow-800"
                      : post.status === 2
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {post.status === 1 ? (
                    <>
                      <ClockIcon size={14} />
                      Chờ duyệt
                    </>
                  ) : post.status === 2 ? (
                    <>
                      <CircleCheckBigIcon size={14} />
                      Đã duyệt
                    </>
                  ) : (
                    <>
                      <ClockIcon size={14} />
                      Đã từ chối
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination for posts */}
        {totalPostPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() =>
                setCurrentPostPage((prev) => Math.max(0, prev - 1))
              }
              disabled={currentPostPage === 0}
              className="p-2 rounded-lg bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <span className="py-2">
              Trang {currentPostPage + 1} / {totalPostPages}
            </span>
            <button
              onClick={() =>
                setCurrentPostPage((prev) =>
                  Math.min(totalPostPages - 1, prev + 1)
                )
              }
              disabled={currentPostPage === totalPostPages - 1}
              className="p-2 rounded-lg bg-gray-100 disabled:opacity-50"
            >
              <ChevronRightIcon size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-end">
        <button
          onClick={onBack}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Quay lại
        </button>
      </div>

      <ConfimationDialog
        isVisible={isDialogVisible}
        title="Xóa trang"
        message="Bạn có chắc muốn xóa trang này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        confirmText="Xóa"
        onCancel={hideDialog}
        color="red"
      />
      <LoadingDialog isVisible={loading} />
    </div>
  );
};

export default PageDetail;
