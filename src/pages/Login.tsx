import { LockIcon, UserCircleIcon } from "lucide-react";
import InputField from "../components/InputField";
import { useState } from "react";
import useForm from "../hooks/useForm";
import { ToastContainer, toast } from "react-toastify";
import Button from "../components/Button";
import { LoadingDialog } from "../components/Dialog";
import useFetch from "../hooks/useFetch";
import UTELogo from "../assets/ute_logo_hcmute.png";
import LoginPageLogo from "../assets/login-page.png";

const Login = () => {
  const { post, loading } = useFetch();
  const [showPassword, setShowPassword] = useState(false);

  const validate = (form: any) => {
    const newErrors: any = {};
    if (!form.username.trim()) {
      newErrors.username = "Tài khoản không được bỏ trống";
    }
    if (!form.password) {
      newErrors.password = "Mật khẩu không được bỏ trống";
    }
    return newErrors;
  };

  const { form, errors, handleChange, isValidForm } = useForm(
    { username: "", password: "" },
    { username: "", password: "" },
    validate
  );

  const handleSubmit = async () => {
    if (isValidForm()) {
      const res = await post("/v1/user/login-admin", form);
      if (res.result) {
        await localStorage.setItem("accessToken", res.data.accessToken);
        toast.success("Đăng nhập thành công");
        window.location.reload();
      } else {
        toast.error(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-blue-500">
      {/* Bên trái */}
      <div className="w-1/3 flex items-center justify-center p-8">
        <div className="text-white text-center">
          <img
            src={UTELogo}
            alt="UTE Zone logo"
            className="w-full md:w-1/4 lg:w-1/6 mb-4 mx-auto"
          />
          <h1 className="text-4xl font-bold mb-4">UTE Zone</h1>
          <img
            src={LoginPageLogo}
            alt="Illustration"
            className="mb-4 mx-auto"
          />
        </div>
      </div>

      {/* Bên phải */}
      <div className="w-2/3 bg-white flex items-center justify-center p-8 rounded-s-3xl">
        <div className="w-full max-w-xl">
          <h2 className="text-3xl font-bold text-center mb-2">Đăng nhập</h2>
          <p className="text-center text-gray-500 mb-6">
            Trang quản trị hệ thống UTEZONE
          </p>
          <div className="space-y-5">
            <InputField
              title="Tài khoản đăng nhập"
              isRequire={true}
              placeholder="Nhập email, SĐT hoặc MSSV"
              onChangeText={(value: any) => handleChange("username", value)}
              value={form.username}
              icon={UserCircleIcon}
              error={errors.username}
            />
            <InputField
              title="Mật khẩu"
              isRequire={true}
              placeholder="Nhập mật khẩu"
              onChangeText={(value: any) => handleChange("password", value)}
              value={form.password}
              icon={LockIcon}
              secureTextEntry={!showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
              error={errors.password}
            />
            <Button
              title="ĐĂNG NHẬP"
              color="royalblue"
              onPress={handleSubmit}
            />
          </div>
        </div>
      </div>

      <LoadingDialog isVisible={loading} />
      <ToastContainer />
    </div>
  );
};

export default Login;
