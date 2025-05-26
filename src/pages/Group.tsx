import { useEffect, useState } from "react";
import Table from "../components/Table";
import { ConfimationDialog, LoadingDialog } from "../components/Dialog";
import useFetch from "../hooks/useFetch";
import Header from "../components/Header";
import InputBox from "../components/InputBox";
import SelectBox from "../components/SelectBox";
import useDialog from "../hooks/useDialog";
import { toast } from "react-toastify";
import Breadcrumb from "../components/Breadcrumb";
import {
  CircleCheckBigIcon,
  CircleXIcon,
  ClockIcon,
  EarthIcon,
  UsersIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  EyeIcon,
  TrashIcon,
  PowerIcon,
  CheckSquareIcon,
  SquareIcon,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import userImg from "../assets/user_icon.png";
import { useGlobalContext } from "../types/context";
import GroupDetail from "../components/group/GroupDetail";

interface GroupData {
  _id: string;
  name: string;
  description: string;
  category: string;
  kind: number;
  status: number;
  isAutoModerationEnabled: boolean;
  avatarUrl?: string;
  totalMembers?: number;
  totalPosts?: number;
}

interface ModerationSetting {
  _id: string;
  entityType: number;
  entityId: string;
  isAutoModerationEnabled: boolean;
  isModerationRequired: boolean;
}

const Group = () => {
  const { profile } = useGlobalContext();
  const { isDialogVisible, hideDialog, showDialog } = useDialog();
  const [groupId, setGroupId] = useState<string | null>(null);
  const [data, setData] = useState<GroupData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [view, setView] = useState("list");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isGlobalAutoModerationEnabled, setIsGlobalAutoModerationEnabled] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const itemsPerPage = 8;
  const [moderationSettings, setModerationSettings] = useState<ModerationSetting[]>([]);

  const handleSelectAllGroups = () => {
    setSelectedGroups(prev => 
      prev.length === data.length 
        ? [] 
        : data.map(group => group._id)
    );
  };

  const columns = [
    {
      label: "",
      accessor: "select",
      align: "center",
      width: "50px",
      render: (item: GroupData) => (
        <button
          onClick={() => handleSelectGroup(item._id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {selectedGroups.includes(item._id) ? (
            <CheckSquareIcon size={18} className="text-blue-600" />
          ) : (
            <SquareIcon size={18} className="text-gray-400" />
          )}
        </button>
      ),
    },
    {
      label: "Tên nhóm",
      accessor: "name",
      align: "left",
      render: (item: GroupData) => (
        <div className="flex items-center space-x-2">
          <img
            src={item.avatarUrl || userImg}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
          <span>{item.name}</span>
        </div>
      ),
    },
    {
      label: "Mô tả",
      accessor: "description",
      align: "left",
      render: (item: GroupData) => {
        const description = item.description.length > 100
          ? item.description.slice(0, 100) + "..."
          : item.description;
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-gray-800">{description}</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-gray-600">
                  <UsersIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">{item.totalMembers || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <MessageSquareIcon className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm">{item.totalPosts || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      label: "Danh mục",
      accessor: "category",
      align: "center",
    },
    {
      label: "Loại",
      accessor: "kind",
      align: "center",
      render: (item: GroupData) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${
            item.kind === 1
              ? "bg-green-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {item.kind === 1 ? (
            <>
              <EarthIcon size={16} />
              Công khai
            </>
          ) : (
            <>
              <UsersIcon size={16} />
              Chỉ thành viên
            </>
          )}
        </span>
      ),
    },
    {
      label: "Trạng thái",
      accessor: "status",
      align: "center",
      render: (item: GroupData) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${
            item.status === 1
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {item.status === 1 ? (
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
      ),
    },
    {
      label: "Duyệt tự động",
      accessor: "isAutoModerationEnabled",
      align: "center",
      render: (item: GroupData) => {
        const isEnabled = getGroupModerationStatus(item._id);
        console.log("Group moderation status:", item._id, isEnabled);
        return (
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleToggleAutoModeration(item._id)}
              className={`p-2 rounded-lg transition-colors ${
                isEnabled
                  ? "text-green-600 hover:bg-green-50 bg-green-50"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
              title={isEnabled ? "Tắt duyệt tự động" : "Bật duyệt tự động"}
            >
              <ShieldCheckIcon size={18} className={isEnabled ? "animate-pulse" : ""} />
            </button>
          </div>
        );
      },
    },
    {
      label: "Hành động",
      accessor: "actions",
      align: "center",
      render: (item: GroupData) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setSelectedGroupId(item._id);
              setView("detail");
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <EyeIcon size={18} />
          </button>
          <button
            onClick={() => handleChangeStatus(item._id, item.status === 1 ? 2 : 1)}
            className={`p-2 rounded-lg transition-colors ${
              item.status === 1
                ? "text-green-600 hover:bg-green-50"
                : "text-yellow-600 hover:bg-yellow-50"
            }`}
            title={item.status === 1 ? "Kích hoạt nhóm" : "Vô hiệu hóa nhóm"}
          >
            <PowerIcon size={18} />
          </button>
          <button
            onClick={() => {
              setGroupId(item._id);
              showDialog();
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa nhóm"
          >
            <TrashIcon size={18} />
          </button>
        </div>
      ),
    },
  ];

  const { get, post, put, del, loading } = useFetch();
  const [searchValues, setSearchValues] = useState({
    name: "",
    category: "",
    status: "",
    kind: "",
  });

  const getData = async () => {
    const query: any = {
      page: currentPage,
      size: itemsPerPage,
    };
    if (searchValues.name) {
      query.name = searchValues.name;
    }
    if (searchValues.category) {
      query.category = searchValues.category;
    }
    if (searchValues.status) {
      query.status = searchValues.status;
    }
    if (searchValues.kind) {
      query.kind = searchValues.kind;
    }
    const res = await get("/v1/group/list", query);
    setData(res.data.content);
    setTotalPages(res.data.totalPages);
  };

  const fetchModerationSettings = async () => {
    try {
      const res = await get("/v1/moderation-settings/list", { kind: 3 });
      if (res.result) {
        console.log("Moderation settings for groups:", res.data);
        setModerationSettings(res.data);
      }
    } catch (error) {
      console.error("Error fetching moderation settings:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getData(), fetchModerationSettings()]);
    };
    fetchData();
  }, [currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleChangeStatus = async (groupId: string, newStatus: number) => {
    try {
      const res = await put(`/v1/group/change-state`, {
        id: groupId,
        status: newStatus
      });
      if (res.result) {
        toast.success(newStatus === 2 ? "Đã kích hoạt nhóm" : "Đã vô hiệu hóa nhóm");
        await handleRefreshData();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái");
    }
  };

  const handleDelete = async () => {
    hideDialog();
    try {
      const res = await del(`/v1/group/delete/${groupId}`);
      if (res.result) {
        toast.success("Xóa nhóm thành công");
        await handleRefreshData();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa nhóm");
    }
  };

  const handleRefreshData = async () => {
    setCurrentPage(0);
    await Promise.all([getData(), fetchModerationSettings()]);
  };

  const handleClear = async () => {
    setSearchValues({ name: "", category: "", status: "", kind: "" });
    setCurrentPage(0);
    await Promise.all([
      get("/v1/group/list", {
        page: 0,
        size: itemsPerPage,
      }).then(res => {
        setData(res.data.content);
        setTotalPages(res.data.totalPages);
      }),
      fetchModerationSettings()
    ]);
  };

  const handleToggleAutoModeration = async (groupId?: string) => {
    try {
      if (groupId) {
        const group = data.find(g => g._id === groupId);
        if (!group) return;
        
        const currentStatus = getGroupModerationStatus(groupId);
        const res = await put(`/v1/moderation-settings/group/${groupId}`, {
          isAutoModerationEnabled: !currentStatus,
          isModerationRequired: true,
          groupId: groupId
        });
        if (res.result) {
          toast.success(res.message);
          await Promise.all([handleRefreshData(), fetchModerationSettings()]);
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await put(`/v1/moderation-settings/groups`, {
          groupIds: selectedGroups,
          isAutoModerationEnabled: !isGlobalAutoModerationEnabled,
          isModerationRequired: true
        });
        if (res.result) {
          toast.success(res.message);
          setSelectedGroups([]);
          await Promise.all([handleRefreshData(), fetchModerationSettings()]);
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật cài đặt duyệt tự động");
    }
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleExtraButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleToggleAutoModeration();
  };

  const getGroupModerationStatus = (groupId: string): boolean => {
    const setting = moderationSettings.find(s => s.entityId === groupId);
    return setting?.isAutoModerationEnabled || false;
  };

  return (
    <>
      <Sidebar
        activeItem="group"
        renderContent={
          <>
            <Breadcrumb
              currentView={view}
              setView={setView}
              listLabel="Quản lý nhóm"
              detailLabel="Chi tiết nhóm"
            />
            {view === "list" ? (
              <>
                <Header
                  createDisabled={true}
                  onSearch={handleRefreshData}
                  onClear={handleClear}
                  SearchBoxes={
                    <>
                      <InputBox
                        value={searchValues.name}
                        onChangeText={(value: string) =>
                          setSearchValues({ ...searchValues, name: value })
                        }
                        placeholder="Tên nhóm..."
                      />
                      <InputBox
                        value={searchValues.category}
                        onChangeText={(value: string) =>
                          setSearchValues({ ...searchValues, category: value })
                        }
                        placeholder="Danh mục..."
                      />
                      <SelectBox
                        onChange={(value: string) =>
                          setSearchValues({
                            ...searchValues,
                            kind: value,
                          })
                        }
                        placeholder="Loại nhóm..."
                        options={[
                          { value: "1", name: "Công khai" },
                          { value: "2", name: "Chỉ thành viên" },
                        ]}
                        labelKey="name"
                        valueKey="value"
                      />
                      <SelectBox
                        onChange={(value: string) =>
                          setSearchValues({
                            ...searchValues,
                            status: value,
                          })
                        }
                        placeholder="Trạng thái..."
                        options={[
                          { value: "1", name: "Chưa kích hoạt" },
                          { value: "2", name: "Đã kích hoạt" },
                        ]}
                        labelKey="name"
                        valueKey="value"
                      />
                    </>
                  }
                />
                <div className="relative">
                  <Table
                    data={data}
                    columns={columns}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    totalPages={totalPages}
                    onView={null}
                    onEdit={null}
                    onDelete={null}
                    onReview={null}
                  />
                  <div className="absolute bottom-0 left-0 mt-4 flex items-center gap-4">
                    <button
                      onClick={handleSelectAllGroups}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {selectedGroups.length === data.length ? (
                        <CheckSquareIcon size={20} className="text-blue-600" />
                      ) : (
                        <SquareIcon size={20} className="text-gray-400" />
                      )}
                      <span>Chọn tất cả</span>
                    </button>
                    {selectedGroups.length > 0 && (
                      <button
                        onClick={handleExtraButtonClick}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isGlobalAutoModerationEnabled
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        <ShieldCheckIcon size={20} />
                        <span>
                          {isGlobalAutoModerationEnabled
                            ? "Tắt duyệt tự động cho các nhóm đã chọn"
                            : "Bật duyệt tự động cho các nhóm đã chọn"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : selectedGroupId ? (
              <GroupDetail
                groupId={selectedGroupId}
                onBack={() => {
                  setView("list");
                  setSelectedGroupId(null);
                }}
              />
            ) : null}
          </>
        }
      />
      <ConfimationDialog
        isVisible={isDialogVisible}
        title="Xóa nhóm"
        message="Bạn có chắc muốn xóa nhóm này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        confirmText="Xóa"
        onCancel={hideDialog}
        color="red"
      />
      <LoadingDialog isVisible={loading} />
    </>
  );
};

export default Group; 