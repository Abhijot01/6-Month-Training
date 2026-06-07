import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/globalSearch.css";

export default function GlobalSearch() {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =====================================================
     ROUTE CONFIG
  ===================================================== */

  const routeConfig = {

    batteries: {
      detail: "/dashboard/part/battery",
      catalog: "/dashboard/parts/batteries",
    },

    chargers: {
      detail: "/dashboard/part/charger",
      catalog: "/dashboard/parts/chargers",
    },

    motors: {
      detail: "/dashboard/part/motor",
      catalog: "/dashboard/parts/motors",
    },

    frames: {
      detail: "/dashboard/part/frame",
      catalog: "/dashboard/parts/frames",
    },

    flight_controllers: {
      detail: "/dashboard/part/flight-controller",
      catalog: "/dashboard/parts/flight-controllers",
    },

    propellers: {
      detail: "/dashboard/part/propeller",
      catalog: "/dashboard/parts/propellers",
    },

    radios: {
      detail: "/dashboard/part/radio",
      catalog: "/dashboard/parts/radios",
    },

    ready_to_fly: {
      detail: "/dashboard/part/rtf",
      catalog: "/dashboard/parts/ready-to-fly",
    },

    video_transmitters: {
      detail: "/dashboard/part/video-transmitter",
      catalog: "/dashboard/parts/video-transmitters",
    },

    esc: {
      detail: "/dashboard/part/esc",
      catalog: "/dashboard/parts/esc",
    },

    firmware: {
      detail: "/dashboard/part/firmware",
      catalog: "/dashboard/parts/firmware",
    },

    software: {
      detail: "/dashboard/part/software",
      catalog: "/dashboard/parts/software",
    },

    cameras: {
      detail: "/dashboard/part/camera",
      catalog: "/dashboard/parts/cameras",
    },

    gps: {
      detail: "/dashboard/part/gps",
      catalog: "/dashboard/parts/gps-modules",
    },

    gps_modules: {
      detail: "/dashboard/part/gps",
      catalog: "/dashboard/parts/gps-modules",
    },

  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = async () => {

    if (!query.trim()) return;

    setLoading(true);
    setResults(null);

    try {

      const res = await fetch(
        `http://localhost:5000/api/search/global?q=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error("Global search failed");
      }

      const data = await res.json();

      console.log("GLOBAL SEARCH RESPONSE:");
      console.log(data);

      setResults(
        data && typeof data === "object"
          ? data
          : null
      );

    } catch (err) {

      console.error(
        "Global search error:",
        err
      );

      setResults(null);

    } finally {

      setLoading(false);
    }
  };

  /* =====================================================
     OPEN DETAIL PAGE
  ===================================================== */

  const openPartPage = (
    category,
    partId
  ) => {

    const route = routeConfig[category];

    if (!route) {

      console.log(
        "Unknown category:",
        category
      );

      return;
    }

    navigate(
      `${route.detail}/${partId}`
    );
  };

  /* =====================================================
     OPEN CATALOG PAGE
  ===================================================== */

  const openCatalogPage = (
    category
  ) => {

    const route = routeConfig[category];

    if (!route) {

      console.log(
        "Unknown category:",
        category
      );

      return;
    }

    if (
      window.location.pathname ===
      route.catalog
    ) {

      window.location.href =
        route.catalog;

      return;
    }

    navigate(route.catalog);
  };

  return (
    <>

      {/* =====================================================
         SEARCH BAR
      ===================================================== */}

      <div className="global-search">

        <input
          type="text"
          placeholder="Search drones, batteries, motors, radios, features..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onKeyDown={(e) => {

            if (e.key === "Enter") {
              handleSearch();
            }

          }}
        />

        <button onClick={handleSearch}>

          {loading
            ? "Scanning..."
            : "Search"}

        </button>

      </div>

      {/* =====================================================
         RESULTS
      ===================================================== */}

      {results && (

        <div
          className="results-grid"
          style={{
            marginTop: 30
          }}
        >

          {/* =====================================================
             MILITARY DRONES
          ===================================================== */}

          {Array.isArray(results.military) &&
            results.military.length > 0 && (

              <>

                <h2>
                  🛰 MILITARY DRONES
                </h2>

                {results.military.map(
                  (d, i) => (

                    <div
                      key={`mil-${i}`}
                      className="result-card"
                    >

                      <h3>
                        {d.title}
                      </h3>

                      {d.subtitle && (
                        <p>
                          {d.subtitle}
                        </p>
                      )}

                      {d.country && (
                        <p>
                          <b>Country:</b>{" "}
                          {d.country}
                        </p>
                      )}

                      {d.drone_class && (
                        <p>
                          <b>Class:</b>{" "}
                          {d.drone_class}
                        </p>
                      )}

                      {d.role_primary && (
                        <p>
                          <b>Role:</b>{" "}
                          {d.role_primary}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/drones/${d.variant_id}`
                          )
                        }
                      >
                        Open Intelligence
                      </button>

                    </div>

                  )
                )}

              </>

            )}

          {/* =====================================================
             PARTS
          ===================================================== */}

          {Object.entries(results)

            .filter(
              ([category, items]) =>
                category !== "military" &&
                Array.isArray(items) &&
                items.length > 0
            )

            .map(([category, items]) => (

              <div key={category}>

                <h2>

                  🔧{" "}

                  {category
                    .replaceAll("_", " ")
                    .toUpperCase()}

                </h2>

                {/* =====================================================
                   TOP RESULTS
                ===================================================== */}

                {items
                  .slice(0, 10)
                  .map((p, i) => (

                    <div
                      key={`${category}-${i}`}
                      className="result-card"
                    >

                      <h3>
                        {p.title ||
                          "Unknown Part"}
                      </h3>

                      {p.subtitle && (
                        <p>
                          {p.subtitle}
                        </p>
                      )}

                      {p.manufacturer && (
                        <p>
                          <b>Manufacturer:</b>{" "}
                          {p.manufacturer}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          openPartPage(
                            category,
                            p.part_id
                          )
                        }
                      >
                        Open Catalog
                      </button>

                    </div>

                  ))}

                {/* =====================================================
                   VIEW ALL
                ===================================================== */}

                {items.length >= 1 && (

                  <div
                    style={{
                      marginTop: "20px",
                      marginBottom: "40px",
                    }}
                  >

                    <button
                      className="view-all-btn"
                      onClick={() =>
                        openCatalogPage(
                          category
                        )
                      }
                    >

                      View All

                    </button>

                  </div>

                )}

              </div>

            ))}

        </div>

      )}

    </>
  );
}