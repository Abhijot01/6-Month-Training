import { useState, useEffect, useRef } from "react";

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  setSelected,
  closeAll
}) {

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  /* =========================================
     CLOSE FROM PARENT
  ========================================= */

  useEffect(() => {

    if (closeAll) {
      setOpen(false);
    }

  }, [closeAll]);

  /* =========================================
     OUTSIDE CLICK CLOSE
  ========================================= */

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  /* =========================================
     TOGGLE OPTION
  ========================================= */

  const toggleOption = (value) => {

    if (selected.includes(value)) {

      setSelected(
        selected.filter((v) => v !== value)
      );

    } else {

      setSelected([
        ...selected,
        value
      ]);
    }
  };

  /* =========================================
     RENDER
  ========================================= */

  return (

    <div
      ref={dropdownRef}
      className={`
        multi-dropdown
        dashboard-multi-dropdown
        ${open ? "open" : ""}
      `}
    >

      {/* HEADER */}

      <div
        className="dropdown-header"
        onClick={() => setOpen(!open)}
      >

        {
          selected.length > 0
            ? `${label} (${selected.length})`
            : label
        }

      </div>

      {/* DROPDOWN MENU */}

      {
        open && (
          <div className="dropdown-menu">

            {
              options.map((opt) => (

                <label
                  key={opt}
                  className="dropdown-option"
                >

                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => toggleOption(opt)}
                  />

                  <span>{opt}</span>

                </label>
              ))
            }

          </div>
        )
      }

    </div>
  );
}