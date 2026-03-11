"use client";

import { useLogin } from "@privy-io/react-auth";

const LoginTracker = () => {
  useLogin({
    onComplete(params) {
      console.log("User logged in", params);
    },
  });

  return null;
};

export default LoginTracker;
