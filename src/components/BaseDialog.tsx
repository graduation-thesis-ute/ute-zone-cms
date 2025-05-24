import { Fragment } from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

interface BaseDialogProps {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  showCloseButton?: boolean;
}

const BaseDialog = ({
  isVisible,
  setVisible,
  title,
  children,
  width = "max-w-md",
  showCloseButton = true,
}: BaseDialogProps) => {
  return (
    <Transition appear show={isVisible} as={Fragment}>
      <HeadlessDialog
        as="div"
        className="relative z-50"
        onClose={() => setVisible(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <HeadlessDialog.Panel
                className={`w-full ${width} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <HeadlessDialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </HeadlessDialog.Title>
                  {showCloseButton && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setVisible(false)}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                {children}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
};

export default BaseDialog;
