import React from "react";
import { useAppContext } from "../context/AppContext";

const Login = () => {
  const { setShowUserLogin, setUser } = useAppContext();
  const [state, setState] = React.useState("login");

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [errors, setErrors] = React.useState({ email: "", password: "" });

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Invalid email format";
  };

  const validatePassword = (value) => {
    return value.length > 16
      ? "Password cannot exceed 16 characters"
      : "";
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Run final validation before submit
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    // Simulating successful login
    setUser({ email, password });
    setShowUserLogin(false);
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-30
        flex items-center text-sm text-grey-600 bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-green-500">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter Full Name"
              className="border border-gray-200 rounded-full w-full p-2 mt-1 outline-primary"
              type="text"
              required
            />
          </div>
        )}

        {/* Email Field */}
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
            }}
            value={email}
            placeholder="Enter Email"
            className="border border-gray-200 rounded-full w-full p-2 mt-1 outline-primary"
            type="email"
            required
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
            }}
            value={password}
            placeholder="Enter Password"
            className="border border-gray-200 rounded-full w-full p-2 mt-1 outline-primary"
            type="password"
            required
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Switch State */}
        {state === "register" ? (
          <p>
            Already have account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-indigo-500 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        ) : (
          <p>
            Create an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-indigo-500 cursor-pointer hover:underline"
            >
              Sign Up
            </span>
          </p>
        )}

        <button
          className="bg-green-600 hover:bg-green-700 transition-all text-white w-full py-2 rounded-full cursor-pointer"
          disabled={!!errors.email || !!errors.password}
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
