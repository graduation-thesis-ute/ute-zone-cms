import { useState } from "react";
import BaseDialog from "../BaseDialog";
import InputBox from "../InputBox";
import { toast } from "react-toastify";

interface SuggestionFormData {
  icon: string;
  text: string;
  order: number;
}

interface CreateSuggestionDialogProps {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  onSubmit: (formData: SuggestionFormData) => void;
}

const CreateSuggestionDialog = ({
  isVisible,
  setVisible,
  onSubmit,
}: CreateSuggestionDialogProps) => {
  const [formData, setFormData] = useState<SuggestionFormData>({
    icon: "",
    text: "",
    order: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.icon || !formData.text) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    onSubmit(formData);
  };

  return (
    <BaseDialog
      isVisible={isVisible}
      setVisible={setVisible}
      title="Thêm câu hỏi gợi ý"
      width="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <InputBox
            value={formData.icon}
            onChangeText={(value: string) =>
              setFormData({ ...formData, icon: value })
            }
            placeholder="Nhập icon (emoji)..."
          />
          <p className="mt-1 text-sm text-gray-500">Ví dụ: 💡, 🕒, ⚠️, ✅</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung
          </label>
          <InputBox
            value={formData.text}
            onChangeText={(value: string) =>
              setFormData({ ...formData, text: value })
            }
            placeholder="Nhập nội dung câu hỏi..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thứ tự hiển thị
          </label>
          <InputBox
            type="number"
            value={formData.order.toString()}
            onChangeText={(value: string) =>
              setFormData({ ...formData, order: parseInt(value) || 0 })
            }
            placeholder="Nhập thứ tự hiển thị..."
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Thêm
          </button>
        </div>
      </form>
    </BaseDialog>
  );
};

export default CreateSuggestionDialog;
