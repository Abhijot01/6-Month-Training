import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname.startsWith(path);

  return (

    <motion.aside
      className="sidebar open"
      initial={{ width: 320 }}
      animate={{ width: 320 }}
    >

      <div className="sidebar-title">
        MENU
      </div>

      <div className="sidebar-menu">

        {/* =========================================
            DRONE INTELLIGENCE
        ========================================= */}

        <button
          className={`
            sidebar-item
            ${isActive("/dashboard/drones") ? "active" : ""}
          `}
          onClick={() => navigate("/dashboard/drones")}
        >
          Drone Intelligence
        </button>

        {/* =========================================
            DRONE PARTS GROUP
        ========================================= */}

        <div className="sidebar-group">

          <button
            className={`
              sidebar-item
              ${isActive("/dashboard/parts") ? "active" : ""}
            `}
            onClick={() =>
              navigate("/dashboard/parts/batteries")
            }
          >
            Drone Parts Catalog
          </button>

          {/* SUBMENU */}

          {isActive("/dashboard/parts") && (

            <div className="sidebar-submenu">

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/batteries") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/batteries")
                }
              >
                Batteries
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/chargers") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/chargers")
                }
              >
                Chargers
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/motors") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/motors")
                }
              >
                Motors
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/frames") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/frames")
                }
              >
                Frames
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/flight-controllers") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/flight-controllers")
                }
              >
                Flight Controllers
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/propellers") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/propellers")
                }
              >
                Propellers
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/radios") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/radios")
                }
              >
                Radios & Receivers
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/rtf") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/rtf")
                }
              >
                Ready-to-Fly
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/video-transmitters") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/video-transmitters")
                }
              >
                Video Transmitters
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/esc") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/esc")
                }
              >
                ESC
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/firmware") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/firmware")
                }
              >
                Firmware
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/software") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/software")
                }
              >
                Software
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/cameras") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/cameras")
                }
              >
                Cameras
              </button>

              <button
                className={`
                  sidebar-subitem
                  ${isActive("/dashboard/parts/gps") ? "active" : ""}
                `}
                onClick={() =>
                  navigate("/dashboard/parts/gps")
                }
              >
                GPS Modules
              </button>

            </div>
          )}

        </div>

        {/* =========================================
            COMPATIBILITY
        ========================================= */}

        <button
          className={`
            sidebar-item
            ${isActive("/dashboard/compatibility") ? "active" : ""}
          `}
          onClick={() =>
            navigate("/dashboard/compatibility")
          }
        >
          Check Compatibility
        </button>

        {/* =========================================
            IMAGE RECOGNITION
        ========================================= */}

        <button
          className={`
            sidebar-item
            ${isActive("/dashboard/image-recognition") ? "active" : ""}
          `}
          onClick={() =>
            navigate("/dashboard/image-recognition")
          }
        >
          Image Recognition
        </button>

      </div>

    </motion.aside>
  );
}