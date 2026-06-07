import { useState } from "react";
import Background from "./Background";
import IntroHero from "./IntroHero";
import LoginCard from "./LoginCard";

export default function LoginScene() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Background />

      {/* 🔥 ADD IT HERE (global overlay) */}

      {!showLogin && <IntroHero onFinish={() => setShowLogin(true)} />}
      {showLogin && <LoginCard />}
    </>
  );
}