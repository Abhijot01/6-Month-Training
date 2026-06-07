import { useState } from "react";
import { motion } from "framer-motion";

export default function UploadCSV() {

  const [file, setFile] = useState(null);

  const [category, setCategory] = useState("batteries");

  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (!file) {
      alert("Choose CSV file");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      formData.append("category", category);

      const res = await fetch(
        "http://localhost:5000/api/upload/csv",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      alert(data.message);

    } catch (err) {

      console.error(err);

      alert("Upload failed");

    } finally {

      setLoading(false);
    }
  };

  return (

    <motion.div
      className="dashboard-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <header className="dashboard-header">

        <h1>CSV Intelligence Upload</h1>

        <span>
          Upload datasets directly into the UAV intelligence database
        </span>

      </header>

      <section
        className="dashboard-filters"
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 20,
        }}
      >

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >

        <option value="batteries">Batteries</option>
        <option value="chargers">Chargers</option>
        <option value="motors">Motors</option>
        <option value="frames">Frames</option>
        <option value="flight_controllers">Flight Controllers</option>
        <option value="propellers">Propellers</option>
        <option value="radios_receivers">Radios & Receivers</option>
        <option value="ready_to_fly">Ready To Fly</option>
        <option value="video_transmitters">Video Transmitters</option>
        <option value="esc">ESC</option>
        <option value="firmware">Firmware</option>
        <option value="software">Software</option>
        <option value="gps_modules">GPS Modules</option>
        <option value="cameras">Cameras</option>

        </select>

        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <button onClick={handleUpload}>

          {loading
            ? "Uploading..."
            : "Upload CSV"}

        </button>

      </section>

    </motion.div>
  );
}