import { motion } from "framer-motion";
import drone from "../assets/drone.png"; 
import "../styles/intro.css";

export default function IntroAnimation({ onDone }) {
  return (
    <motion.div
      className="intro-wrapper"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 4, duration: 1 }}
      onAnimationComplete={onDone}
    >
      <motion.img
        src={drone}
        className="drone"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <motion.h1
        initial={{ letterSpacing: "1em", opacity: 0 }}
        animate={{ letterSpacing: "0.15em", opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.5 }}
      >
        DRONE FORENSICS
      </motion.h1>
    </motion.div>
  );
}
