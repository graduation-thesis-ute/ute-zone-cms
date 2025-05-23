import { useEffect, useState } from "react";
import Table from "../components/Table";
import { LoadingDialog } from "../components/Dialog";
import useFetch from "../hooks/useFetch";
import Header from "../components/Header";
import InputBox from "../components/InputBox";
import Sidebar from "../components/Sidebar";
import { Trash2, Upload } from "lucide-react";
import UploadDocumentDialog from "../components/document/UploadDocumentDialog";

const Document = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const itemsPerPage = 10;

  const columns = [
    { label: "Tên tài liệu", accessor: "name", align: "left" },
    {
      label: "Loại tài liệu",
      accessor: "type",
      align: "center",
      render: (item: any) => (
        <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800">
          {item.type}
        </span>
      ),
    },
    // {
    //   label: "Kích thước",
    //   accessor: "size",
    //   align: "center",
    //   render: (item: any) => {
    //     const sizeInMB = (item.size / (1024 * 1024)).toFixed(2);
    //     return `${sizeInMB} MB`;
    //   },
    // },
    {
      label: "Ngày tải lên",
      accessor: "createdAt",
      align: "center",
    },
    {
      label: "Thao tác",
      accessor: "actions",
      align: "center",
      render: (item: any) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded-md"
            title="Xóa tài liệu"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const { get, post, del, loading } = useFetch();
  const [searchValues, setSearchValues] = useState({
    name: "",
  });

  const getData = async () => {
    const query: any = {
      page: currentPage,
      size: itemsPerPage,
    };
    if (searchValues.name) {
      query.name = searchValues.name;
    }
    const res = await get("/v1/chatbot/documents", query);
    console.log("chatbot documents:", res.content);
    setData(res.content);
    setTotalPages(res.totalPages);
  };

  useEffect(() => {
    getData();
  }, [currentPage, searchValues.name]);

  const handlePageChange = (pageNumber: any) => {
    setCurrentPage(pageNumber);
  };

  const handleRefreshData = async () => {
    setCurrentPage(0);
    await getData();
  };

  const handleClear = async () => {
    setSearchValues({ name: "" });
    setCurrentPage(0);
    await getData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      await del(`/v1/chatbot/documents/${id}`);
      await handleRefreshData();
    }
  };

  const handleUpload = async (file: File, title: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const res = await post("/v1/chatbot/documents", formData);
      if (res.error) {
        throw new Error(res.error);
      }

      setUploadModalVisible(false);
      await handleRefreshData();
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi tải lên tài liệu");
    }
  };

  return (
    <>
      <Sidebar
        activeItem="document"
        renderContent={
          <>
            <Header
              createDisabled={false}
              onCreate={() => setUploadModalVisible(true)}
              onSearch={handleRefreshData}
              onClear={handleClear}
              createButtonText="Tải lên tài liệu"
              createButtonIcon={<Upload size={18} />}
              SearchBoxes={
                <>
                  <InputBox
                    value={searchValues.name}
                    onChangeText={(value: any) =>
                      setSearchValues({ ...searchValues, name: value })
                    }
                    placeholder="Tên tài liệu..."
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
      <UploadDocumentDialog
        isVisible={uploadModalVisible}
        setVisible={setUploadModalVisible}
        onUpload={handleUpload}
      />
    </>
  );
};

export default Document;
