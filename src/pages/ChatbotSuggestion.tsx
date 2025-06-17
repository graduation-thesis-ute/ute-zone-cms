import { useEffect, useState } from "react";
import Table from "../components/Table";
import { ConfimationDialog, LoadingDialog } from "../components/Dialog";
import useFetch from "../hooks/useFetch";
import Header from "../components/Header";
import InputBox from "../components/InputBox";
import Sidebar from "../components/Sidebar";
import { Edit2, Plus, Trash2 } from "lucide-react";
import useDialog from "../hooks/useDialog";
import { toast } from "react-toastify";
import CreateSuggestionDialog from "../components/chatbot/CreateSuggestionDialog";
import UpdateSuggestionDialog from "../components/chatbot/UpdateSuggestionDialog";

interface Suggestion {
  _id: string;
  icon: string;
  text: string;
  order: number;
  isActive: boolean;
}

const ChatbotSuggestion = () => {
  const { isDialogVisible, showDialog, hideDialog } = useDialog();
  const [data, setData] = useState<Suggestion[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [suggestionToEdit, setSuggestionToEdit] = useState<Suggestion | null>(
    null
  );
  const [suggestionToDelete, setSuggestionToDelete] =
    useState<Suggestion | null>(null);
  const itemsPerPage = 10;

  const columns = [
    {
      label: "Icon",
      accessor: "icon",
      align: "center",
      render: (item: any) => <span className="text-2xl">{item.icon}</span>,
    },
    {
      label: "Nội dung",
      accessor: "text",
      align: "left",
    },
    {
      label: "Thứ tự",
      accessor: "order",
      align: "center",
    },
    {
      label: "Trạng thái",
      accessor: "isActive",
      align: "center",
      render: (item: any) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-md ${
            item.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.isActive ? "Đang hiển thị" : "Đã ẩn"}
        </span>
      ),
    },
    {
      label: "Hành động",
      accessor: "actions",
      align: "center",
      render: (item: any) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
            title="Chỉnh sửa"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-1 text-red-600 hover:bg-red-100 rounded-md"
            title="Xóa"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const { get, post, put, del, loading } = useFetch();
  const [searchValues, setSearchValues] = useState({
    text: "",
  });

  const getData = async () => {
    const query: any = {
      page: currentPage,
      size: itemsPerPage,
    };
    if (searchValues.text) {
      query.text = searchValues.text;
    }
    const res = await get("/v1/chatbot/suggestions", query);
    setData(res.content);
    setTotalPages(res.totalPages);
  };

  useEffect(() => {
    getData();
  }, [currentPage, searchValues.text]);

  const handlePageChange = (pageNumber: any) => {
    setCurrentPage(pageNumber);
  };

  const handleRefreshData = async () => {
    setCurrentPage(0);
    await getData();
  };

  const handleClear = async () => {
    setSearchValues({ text: "" });
    setCurrentPage(0);
    await getData();
  };

  const handleEdit = (suggestion: any) => {
    setSuggestionToEdit(suggestion);
    setUpdateModalVisible(true);
  };

  const handleDelete = (suggestion: any) => {
    setSuggestionToDelete(suggestion);
    showDialog();
  };

  const confirmDelete = async () => {
    hideDialog();
    if (suggestionToDelete) {
      try {
        await del(`/v1/chatbot/suggestions/${suggestionToDelete._id}`);
        toast.success("Xóa câu hỏi gợi ý thành công");
        await handleRefreshData();
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi xóa câu hỏi gợi ý");
      }
      setSuggestionToDelete(null);
    }
  };

  const handleCreate = async (formData: any) => {
    try {
      await post("/v1/chatbot/suggestions", formData);
      toast.success("Thêm câu hỏi gợi ý thành công");
      setCreateModalVisible(false);
      await handleRefreshData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi thêm câu hỏi gợi ý");
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!suggestionToEdit) return;
    try {
      await put(`/v1/chatbot/suggestions/${suggestionToEdit._id}`, formData);
      toast.success("Cập nhật câu hỏi gợi ý thành công");
      setUpdateModalVisible(false);
      setSuggestionToEdit(null);
      await handleRefreshData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật câu hỏi gợi ý");
    }
  };

  return (
    <>
      <Sidebar
        activeItem="suggestion"
        renderContent={
          <>
            <Header
              createDisabled={false}
              onCreate={() => setCreateModalVisible(true)}
              onSearch={handleRefreshData}
              onClear={handleClear}
              createButtonText="Thêm câu hỏi gợi ý"
              createButtonIcon={<Plus size={18} />}
              SearchBoxes={
                <>
                  <InputBox
                    value={searchValues.text}
                    onChangeText={(value: any) =>
                      setSearchValues({ ...searchValues, text: value })
                    }
                    placeholder="Nội dung câu hỏi..."
                  />
                </>
              }
            />
            <Table
              data={data}
              columns={columns}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          </>
        }
      />
      <LoadingDialog isVisible={loading} />
      <ConfimationDialog
        isVisible={isDialogVisible}
        title="Xóa câu hỏi gợi ý"
        message="Bạn có chắc muốn xóa câu hỏi gợi ý này?"
        onConfirm={confirmDelete}
        confirmText="Xóa"
        onCancel={() => {
          hideDialog();
          setSuggestionToDelete(null);
        }}
        color="red"
      />
      <CreateSuggestionDialog
        isVisible={createModalVisible}
        setVisible={setCreateModalVisible}
        onSubmit={handleCreate}
      />
      <UpdateSuggestionDialog
        isVisible={updateModalVisible}
        setVisible={setUpdateModalVisible}
        suggestion={suggestionToEdit}
        onSubmit={handleUpdate}
      />
    </>
  );
};

export default ChatbotSuggestion;
