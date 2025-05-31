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
  ClockIcon,
  EarthIcon,
  MessageSquareIcon,
  UsersIcon,
  ShieldCheckIcon,
  EyeIcon,
  TrashIcon,
  PowerIcon,
  CheckSquareIcon,
  SquareIcon,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import userImg from "../assets/user_icon.png";
import PageDetail from "../components/page/PageDetail";

interface PageData {
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

const Page = () => {
  // const { profile } = useGlobalContext();
  const { isDialogVisible, hideDialog, showDialog } = useDialog();
  const [pageId, setPageId] = useState(null);
  const [data, setData] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [view, setView] = useState("list");
  // const [isAutoModerationEnabled, setIsAutoModerationEnabled] = useState(false);
  const itemsPerPage = 8;
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  // const [isGlobalAutoModerationEnabled, setIsGlobalAutoModerationEnabled] = useState(false);
  const [moderationSettings, setModerationSettings] = useState<
    ModerationSetting[]
  >([]);

  const columns = [
    {
      label: "",
      accessor: "select",
      align: "center",
      width: "50px",
      render: (item: any) => (
        <button
          onClick={() => handleSelectPage(item._id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {selectedPages.includes(item._id) ? (
            <CheckSquareIcon size={18} className="text-blue-600" />
          ) : (
            <SquareIcon size={18} className="text-gray-400" />
          )}
        </button>
      ),
    },
    {
      label: "Tên trang",
      accessor: "name",
      align: "left",
      render: (item: any) => (
        <span className="flex items-center space-x-2">
          <img
            src={item.avatarUrl || userImg}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
          <span>{item.name}</span>
        </span>
      ),
    },
    {
      label: "Mô tả",
      accessor: "description",
      align: "left",
      render: (item: any) => {
        const description =
          item.description.length > 100
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
      render: (item: any) => (
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
              Chỉ người theo dõi
            </>
          )}
        </span>
      ),
    },
    {
      label: "Trạng thái",
      accessor: "status",
      align: "center",
      render: (item: any) => (
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
      render: (item: PageData) => {
        const isEnabled = getPageModerationStatus(item._id);
        console.log("Page moderation status:", item._id, isEnabled);
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
              <ShieldCheckIcon
                size={18}
                className={isEnabled ? "animate-pulse" : ""}
              />
            </button>
          </div>
        );
      },
    },
    {
      label: "Hành động",
      accessor: "actions",
      align: "center",
      render: (item: any) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setSelectedPageId(item._id);
              setView("detail");
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <EyeIcon size={18} />
          </button>
          <button
            onClick={() =>
              handleChangeStatus(item._id, item.status === 1 ? 2 : 1)
            }
            className={`p-2 rounded-lg transition-colors ${
              item.status === 1
                ? "text-green-600 hover:bg-green-50"
                : "text-yellow-600 hover:bg-yellow-50"
            }`}
            title={item.status === 1 ? "Kích hoạt trang" : "Vô hiệu hóa trang"}
          >
            <PowerIcon size={18} />
          </button>
          <button
            onClick={() => {
              setPageId(item._id);
              showDialog();
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa trang"
          >
            <TrashIcon size={18} />
          </button>
        </div>
      ),
    },
  ];

  const { get, put, del, loading } = useFetch();
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
    const res = await get("/v1/page/list", query);
    console.log("Page data from API:", res.data.content);
    setData(res.data.content);
    setTotalPages(res.data.totalPages);
  };

  const fetchModerationSettings = async () => {
    try {
      const res = await get("/v1/moderation-settings/list", { kind: 2 });
      if (res.result) {
        console.log("Fetched moderation settings:", res.data);
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

  const handlePageChange = (pageNumber: any) => {
    setCurrentPage(pageNumber);
  };

  const handleChangeStatus = async (pageId: string, newStatus: number) => {
    try {
      const res = await put(`/v1/page/change-state`, {
        id: pageId,
        status: newStatus,
      });
      if (res.result) {
        toast.success(
          newStatus === 2 ? "Đã kích hoạt trang" : "Đã vô hiệu hóa trang"
        );
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
      const res = await del(`/v1/page/delete/${pageId}`);
      if (res.result) {
        toast.success("Xóa trang thành công");
        await handleRefreshData();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa trang");
    }
  };

  const handleRefreshData = async () => {
    console.log("Refreshing data...");
    setCurrentPage(0);
    await Promise.all([getData(), fetchModerationSettings()]);
  };

  const handleClear = async () => {
    setSearchValues({ name: "", category: "", status: "", kind: "" });
    setCurrentPage(0);
    const res = await get("/v1/page/list", {
      page: 0,
      size: itemsPerPage,
    });
    setData(res.data.content);
    setTotalPages(res.data.totalPages);
  };

  const getPageModerationStatus = (pageId: string): boolean => {
    const setting = moderationSettings.find((s) => s.entityId === pageId);
    console.log("Getting moderation status for page:", { pageId, setting });
    return setting?.isAutoModerationEnabled || false;
  };

  const handleToggleAutoModeration = async (pageId?: string) => {
    try {
      if (pageId) {
        const page = data.find((p) => p._id === pageId);
        if (!page) return;

        const currentStatus = getPageModerationStatus(pageId);
        console.log("Toggle single page:", { pageId, currentStatus });

        const res = await put(`/v1/moderation-settings/page`, {
          isAutoModerationEnabled: !currentStatus,
          isModerationRequired: true,
          pageId: pageId,
        });
        console.log("Single page toggle response:", res);

        if (res.result) {
          toast.success(res.message);
          await Promise.all([handleRefreshData(), fetchModerationSettings()]);
        } else {
          toast.error(res.message);
        }
      } else {
        // Kiểm tra trạng thái hiện tại của các trang được chọn
        const selectedPagesStatus = selectedPages.map((pageId) => ({
          pageId,
          status: getPageModerationStatus(pageId),
        }));
        console.log("Selected pages status:", selectedPagesStatus);

        const allEnabled = selectedPagesStatus.every(
          (item) => item.status === true
        );
        console.log("All enabled:", allEnabled);

        // Cập nhật từng trang một
        const results = await Promise.all(
          selectedPages.map(async (pageId) => {
            const res = await put(`/v1/moderation-settings/page`, {
              isAutoModerationEnabled: !allEnabled,
              isModerationRequired: true,
              pageId: pageId,
            });
            return { pageId, success: res.result };
          })
        );

        console.log("Multiple pages update results:", results);

        const allSuccess = results.every((r) => r.success);
        if (allSuccess) {
          toast.success(
            "Đã cập nhật cài đặt duyệt tự động cho tất cả các trang đã chọn"
          );
          setSelectedPages([]);
          await Promise.all([handleRefreshData(), fetchModerationSettings()]);
        } else {
          toast.error(
            "Có một số trang không thể cập nhật cài đặt duyệt tự động"
          );
        }
      }
    } catch (error) {
      console.error("Error in handleToggleAutoModeration:", error);
      toast.error("Có lỗi xảy ra khi cập nhật cài đặt duyệt tự động");
    }
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleSelectAllPages = () => {
    setSelectedPages((prev) =>
      prev.length === data.length ? [] : data.map((page) => page._id)
    );
  };

  const handleExtraButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleToggleAutoModeration();
  };

  const renderMultiSelectButton = () => {
    if (selectedPages.length === 0) return null;

    const selectedPagesStatus = selectedPages.map((pageId) =>
      getPageModerationStatus(pageId)
    );
    const allEnabled = selectedPagesStatus.every((status) => status === true);

    return (
      <button
        onClick={handleExtraButtonClick}
        className={`p-2 rounded-lg transition-colors ${
          allEnabled
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }`}
        title={
          allEnabled
            ? "Tắt duyệt tự động cho các trang đã chọn"
            : "Bật duyệt tự động cho các trang đã chọn"
        }
      >
        <ShieldCheckIcon size={20} />
      </button>
    );
  };

  return (
    <>
      <Sidebar
        activeItem="page"
        renderContent={
          <>
            <Breadcrumb
              currentView={view}
              setView={setView}
              listLabel="Quản lý trang"
              detailLabel="Chi tiết trang"
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
                        onChangeText={(value: any) =>
                          setSearchValues({ ...searchValues, name: value })
                        }
                        placeholder="Tên trang..."
                      />
                      <InputBox
                        value={searchValues.category}
                        onChangeText={(value: any) =>
                          setSearchValues({ ...searchValues, category: value })
                        }
                        placeholder="Danh mục..."
                      />
                      <SelectBox
                        onChange={(value: any) =>
                          setSearchValues({
                            ...searchValues,
                            kind: value,
                          })
                        }
                        placeholder="Loại trang..."
                        options={[
                          { value: "1", name: "Công khai" },
                          { value: "2", name: "Chỉ người theo dõi" },
                        ]}
                        labelKey="name"
                        valueKey="value"
                      />
                      <SelectBox
                        onChange={(value: any) =>
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
                      onClick={handleSelectAllPages}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {selectedPages.length === data.length ? (
                        <CheckSquareIcon size={20} className="text-blue-600" />
                      ) : (
                        <SquareIcon size={20} className="text-gray-400" />
                      )}
                      <span>Chọn tất cả</span>
                    </button>
                    {selectedPages.length > 0 && renderMultiSelectButton()}
                  </div>
                </div>
              </>
            ) : selectedPageId ? (
              <PageDetail
                pageId={selectedPageId}
                onBack={() => {
                  setView("list");
                  setSelectedPageId(null);
                }}
              />
            ) : null}
          </>
        }
      />
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
    </>
  );
};

export default Page;
