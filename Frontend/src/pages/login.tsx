import React from "react";

const Login = () => {
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0edc8bfc8f1149baac2c31ce449116efa0a2d38935ca1554c9e6ec50223560e3"
            alt="Logo"
            className="w-16"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
        <p className="text-gray-400 mb-6">Log in to access your account.</p>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors w-full"
        >
          Login with Microsoft
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-gray-500 text-sm">
        © {new Date().getFullYear()} Insight Advantage. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;

// import Image from "next/image";

// export default function Login() {
//   return (
//     <div className="flex flex-col items-start px-16 pt-16 pb-10 text-sm font-medium text-white bg-zinc-800 max-md:px-5 min-h-screen">
//       {/* Logo Section */}
//       <div className="flex gap-5 text-2xl font-semibold leading-9 text-gray-200 items-center">
//         <Image
//           loading="lazy"
//           src="https://cdn.builder.io/api/v1/image/assets/TEMP/e4530146a7babe0dc1844a2da981060779e6ebf2a0e0efdebdb67e544177c109?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c&width=100"
//           width={119}
//           height={68} // Example height (adjust according to image ratio)
//           alt="Insight Advantage Logo"
//         />
//         <div>
//           Insight <br />
//           Advantage
//         </div>
//       </div>

//       {/* Login Section */}
//       <div className="mt-16 text-3xl font-bold max-md:mt-10">
//         Login into your account
//       </div>

//       {/* Email Field */}
//       <label htmlFor="email" className="mt-12 text-lg max-md:mt-10">
//         Email Address
//       </label>
//       <div className="flex gap-5 justify-between pl-3.5 mt-3.5 max-w-full bg-gray-100 rounded-lg text-zinc-600 w-[315px]">
//         <input
//           type="email"
//           placeholder="Enter your email address"
//           className="flex-grow bg-transparent border-none focus:outline-none"
//         />
//         <Image
//           loading="lazy"
//           src="https://cdn.builder.io/api/v1/image/assets/TEMP/1499882c57ba758261764ef60b36de914309a0af75c9d0f7676ec47ad0ba9376?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
//           width={50}
//           height={50}
//           alt="Email Icon"
//         />
//       </div>

//       {/* Password Field */}
//       <label htmlFor="password" className="mt-5 text-lg">
//         Password
//       </label>
//       <div className="flex gap-5 justify-between pl-3.5 mt-3.5 max-w-full bg-gray-100 rounded-lg text-zinc-600 w-[315px]">
//         <input
//           type="password"
//           placeholder="Enter your password"
//           className="flex-grow bg-transparent border-none focus:outline-none"
//         />
//         <Image
//           loading="lazy"
//           src="https://cdn.builder.io/api/v1/image/assets/TEMP/0615daa4035a71ba438ea9655c547139880964fbb94fd40dbfc88576f82f6346?placeholderIfAbsent=true&apiKey=877b457759d54d259ca44608a719ca2c"
//           width={50}
//           height={50}
//           alt="Password Icon"
//         />
//       </div>

//       {/* Forgot Password Link */}
//       <div className="mt-5 text-amber-300 cursor-pointer">Forgot Password?</div>

//       {/* Login Button */}
//       <button className="w-full py-3 mt-6 text-base font-bold text-black bg-amber-300 rounded-lg shadow-lg max-w-[315px] hover:bg-amber-400 focus:ring-4 focus:ring-amber-500">
//         Login Now
//       </button>

//       {/* Sign Up Link */}
//       <div className="mt-5 text-base">
//         Don’t have an account?
//         <span className="font-bold text-amber-300 underline cursor-pointer">
//           Create new
//         </span>
//       </div>
//     </div>
//   );
// }
