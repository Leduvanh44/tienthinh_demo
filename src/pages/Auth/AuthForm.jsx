import React, { useState, useEffect } from "react";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom"
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isLogin: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation()
  const navigate = useNavigate()
  const [currentPath, setCurrentPath] = useState(location.pathname)
  const handleClick = (route) => {
      navigate(route)
      setCurrentPath(route)
  }
  useEffect(() => {
    const savedData = localStorage.getItem("loginData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData({
        email: parsedData.email || "",
        password: parsedData.password || "",
        isLogin: parsedData.isLogin || false
      });
    }
  }, []);
  console.log(formData)
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const updatedFormData = { ...formData, isLogin: true };
        localStorage.setItem("loginData", JSON.stringify(updatedFormData));
        setFormData(updatedFormData);
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setIsLoading(false);
        handleClick("/Data");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-roboto">
            Log in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="isLogin" value={formData.isLogin} />
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm text-gray-700 font-roboto"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="email-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>
            <div className="mb-4 relative">
              <label
                htmlFor="password"
                className="block text-sm font-roboto text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="password-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Login to account"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
