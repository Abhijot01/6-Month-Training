import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import "../styles/dashboard.css";

export default function FirmwareDetail() {

  const { id } = useParams();

  const [firmware, setFirmware] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFirmware = useCallback(async () => {

    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/firmware/${id}`
      );

      const data = await res.json();

      setFirmware(data);

    } catch (err) {

      console.error(
        "Firmware detail failed",
        err
      );

    } finally {

      setLoading(false);
    }

  }, [id]);

  useEffect(() => {
    fetchFirmware();
  }, [fetchFirmware]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!firmware) {
    return <div className="loading">Firmware not found</div>;
  }

  return (

    <div className="dashboard-root">

      <div className="dashboard-content grid">

        <div className="data-card">

          <h2>{firmware.name}</h2>

          <p><strong>Code:</strong> {firmware.firmware_code}</p>
          <p><strong>Category:</strong> {firmware.category}</p>
          <p><strong>Purpose:</strong> {firmware.purpose}</p>

          <p><strong>License:</strong> {firmware.license_type}</p>
          <p><strong>Status:</strong> {firmware.development_status}</p>

          <p><strong>Industry Adoption:</strong> {firmware.industry_adoption}</p>

          <p><strong>Typical Use:</strong> {firmware.typical_use}</p>

        </div>

      </div>

    </div>
  );
}
