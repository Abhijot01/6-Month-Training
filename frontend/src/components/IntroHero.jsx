import { motion } from "framer-motion";
import drone from "../assets/drone.png";
import "../styles/intro.css";

export default function IntroHero({ onFinish }) {
  return (
    <motion.div
      className="intro-hero"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 4, duration: 1 }}
      onAnimationComplete={onFinish}
    >
      {/* Drone */}
      <motion.img
        src={drone}
        className="drone-img"
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, letterSpacing: "0.6em" }}
        animate={{ opacity: 1, letterSpacing: "0.15em" }}
        transition={{ delay: 0.9, duration: 1.6, ease: "easeOut" }}
      >
        DRONE{" "}FORENSICS
      </motion.h1>
    </motion.div>
  );
}
