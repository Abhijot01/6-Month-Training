import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/dashboard.css";

export default function DroneDetail() {
  const { variant_id } = useParams();
  const [drone, setDrone] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/search/variant/${variant_id}`)
      .then(res => res.json())
      .then(setDrone);
  }, [variant_id]);

  if (!drone) {
    return (

        <div className="dashboard-root">
          <h2>Loading drone intelligence...</h2>
        </div>
     
    );
  }

  return (


      <div className="dashboard-root">
        <div className="detail-container">

          {/* IMAGE */}
          {drone.image_filename && (
            <div className="detail-image-wrapper">
              <img
                src={`http://localhost:5000/uploads/drones/${drone.image_filename}`}
                alt={drone.platform_name}
                className="detail-image"
              />
            </div>
          )}

          {/* INFO */}
          <div className="detail-info">
            <h1>{drone.platform_name}</h1>
            <p className="detail-variant">Variant: {drone.variant_name}</p>

            <div className="detail-divider" />

            <p><b>Country:</b> {drone.country_name}</p>
            <p><b>Class:</b> {drone.drone_class}</p>
            <p><b>Variant Type:</b> {drone.variant_type}</p>
            <p><b>Primary Role:</b> {drone.role_primary}</p>
            {drone.role_secondary && (
              <p><b>Secondary Role:</b> {drone.role_secondary}</p>
            )}

            <hr />

            <p><b>Launch:</b> {drone.launch_type}</p>
            <p><b>Recovery:</b> {drone.recovery_type}</p>
            <p><b>Propulsion:</b> {drone.propulsion_type}</p>

            <p><b>Wingspan:</b> {drone.wingspan_m ?? "N/A"} m</p>
            <p><b>MTOW:</b> {drone.mtow_kg ?? "N/A"} kg</p>
            <p><b>Payload:</b> {drone.max_payload_kg ?? "N/A"} kg</p>

            <p><b>Endurance:</b> {drone.endurance_hr ?? "N/A"} hr</p>
            <p><b>Range:</b> {drone.operational_range_km ?? "N/A"} km</p>

            <p><b>Ceiling:</b> {drone.service_ceiling_m ?? "N/A"} m</p>

            <p><b>Power:</b> {drone.power_source}</p>

            <span className={drone.armament_capable ? "armed" : "unarmed"}>
              {drone.armament_capable ? "Armed" : "Unarmed"}
            </span>

            {drone.sensor_types && (
              <p><b>Sensors:</b> {drone.sensor_types}</p>
            )}

            {drone.notes && (
              <p className="muted"><b>Notes:</b> {drone.notes}</p>
            )}
          </div>

        </div>
      </div>
  );
}