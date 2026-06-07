import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginScene from "./components/LoginScene";

/* 🔥 MAIN LAYOUT */
import DashboardMain from "./components/DashboardMain";
import UploadCSV from "./components/UploadCSV";
/* 🔥 PAGES */
import DashboardHome from "./components/DashboardHome";
import DashboardDrones from "./components/DashboardDrones";
import DroneDetail from "./components/DroneDetail";

/* 🔧 PARTS */
import DashboardBatteries from "./components/DashboardBatteries";
import DashboardChargers from "./components/DashboardChargers";
import DashboardMotors from "./components/DashboardMotors";
import DashboardFrames from "./components/DashboardFrames";
import DashboardFlightControllers from "./components/DashboardFlightControllers";
import DashboardPropellers from "./components/DashboardPropellers";
import DashboardRadios from "./components/DashboardRadios";
import DashboardReadyToFly from "./components/DashboardReadyToFly";
import DashboardVideoTransmitters from "./components/DashboardVideoTransmitters";
import DashboardESC from "./components/DashboardESC";
import DashboardFirmware from "./components/DashboardFirmware";
import DashboardSoftware from "./components/DashboardSoftware";
import DashboardCameras from "./components/DashboardCameras";
import DashboardGPS from "./components/DashboardGPS";
import ImageRecognition from "./components/ImageRecognition";
import BatteryDetail from "./components/BatteryDetail";
import ChargerDetail from "./components/ChargerDetail";
import MotorDetail from "./components/MotorDetail";
import FrameDetail from "./components/FrameDetail";
import FlightControllerDetail from "./components/FlightControllerDetail";
import ESCDetail from "./components/ESCDetail";
import PropellerDetail from "./components/PropellerDetail";
import RadioDetail from "./components/RadioDetail";
import RTFDetail from "./components/RTFDetail";
import VideoTransmitterDetail from "./components/VideoTransmitterDetail";
import FirmwareDetail from "./components/FirmwareDetail";
import SoftwareDetail from "./components/SoftwareDetail";
import CameraDetail from "./components/CameraDetail";
import GPSDetail from "./components/GPSDetail";
import ManualEntry from "./components/ManualEntry";

/* ⚙️ COMPATIBILITY */
import DashboardCompatibility from "./components/Compatibility/DashboardCompatibility";
import EscMotor from "./components/Compatibility/EscMotor";
import MotorProp from "./components/Compatibility/MotorProp";
import FrameProp from "./components/Compatibility/FrameProp";
import Recommendation from "./components/Compatibility/Recommendation";
import Chatbot from "./components/Chatbot/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<LoginScene />} />

        {/* 🔥 DASHBOARD (WITH SIDEBAR LAYOUT) */}
        <Route path="/dashboard" element={<DashboardMain />}>
        <Route path="/dashboard/upload" element={<UploadCSV />} />

          {/* ✅ MAIN DASHBOARD */}
          <Route index element={<DashboardHome />} />

          {/* ✅ DRONES */}
          <Route path="drones" element={<DashboardDrones />} />
          <Route path="drones/:variant_id" element={<DroneDetail />} />

          {/* ✅ PARTS */}
          <Route path="parts/batteries" element={<DashboardBatteries />} />
          <Route path="parts/chargers" element={<DashboardChargers />} />
          <Route path="parts/motors" element={<DashboardMotors />} />
          <Route path="parts/frames" element={<DashboardFrames />} />
          <Route path="parts/flight-controllers" element={<DashboardFlightControllers />} />
          <Route path="parts/propellers" element={<DashboardPropellers />} />
          <Route path="parts/radios" element={<DashboardRadios />} />
          <Route path="parts/rtf" element={<DashboardReadyToFly />} />
          <Route path="parts/video-transmitters" element={<DashboardVideoTransmitters />} />
          <Route path="parts/esc" element={<DashboardESC />} />
          <Route path="parts/firmware" element={<DashboardFirmware />} />
          <Route path="parts/software" element={<DashboardSoftware />} />
          <Route path="parts/cameras" element={<DashboardCameras />} />
          <Route path="parts/gps" element={<DashboardGPS />} />
          <Route path="/dashboard/image-recognition" element={<ImageRecognition />} />
          <Route path="part/battery/:id" element={<BatteryDetail />} />
          <Route path="part/charger/:id" element={<ChargerDetail />} />
          <Route path="/dashboard/part/motor/:id" element={<MotorDetail />} />
          <Route path="/dashboard/part/frame/:id" element={<FrameDetail />} />
          <Route path="/dashboard/part/flight-controller/:id" element={<FlightControllerDetail />} />
          <Route path="/dashboard/part/esc/:id" element={<ESCDetail />} />
          <Route path="/dashboard/part/propeller/:id" element={<PropellerDetail />} />
          <Route path="/dashboard/part/radio/:id" element={<RadioDetail />} />
          <Route path="/dashboard/part/rtf/:id" element={<RTFDetail />} />
          <Route path="/dashboard/part/video-transmitter/:id" element={<VideoTransmitterDetail />} />
          <Route path="/dashboard/part/firmware/:id" element={<FirmwareDetail />} />
          <Route path="/dashboard/part/software/:id" element={<SoftwareDetail />} />
          <Route path="/dashboard/part/camera/:id" element={<CameraDetail />} />
          <Route path="/dashboard/part/gps/:id" element={<GPSDetail />} />
          <Route path="manual-entry" element={<ManualEntry />} />

          {/* ✅ COMPATIBILITY */}
          <Route path="compatibility" element={<DashboardCompatibility />} />
          <Route path="compatibility/esc-motor" element={<EscMotor />} />
          <Route path="compatibility/motor-prop" element={<MotorProp />} />
          <Route path="compatibility/frame-prop" element={<FrameProp />} />
          <Route path="/dashboard/compatibility/recommend" element={<Recommendation />}
/>
        </Route>

      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;