const componentSchemas = {

  batteries: [

  {
    name: "battery_code",
    label: "Battery Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "battery_chemistry",
    label: "Battery Chemistry",
    type: "text",
    required: false,
  },

  {
    name: "cell_count",
    label: "Cell Count",
    type: "number",
    required: false,
  },

  {
    name: "voltage_v",
    label: "Voltage (V)",
    type: "number",
    required: false,
  },

  {
    name: "capacity_mah",
    label: "Capacity (mAh)",
    type: "number",
    required: false,
  },

  {
    name: "discharge_rate_c",
    label: "Discharge Rate (C)",
    type: "number",
    required: false,
  },

  {
    name: "energy_wh",
    label: "Energy (Wh)",
    type: "number",
    required: false,
  },

  {
    name: "connector_type",
    label: "Connector Type",
    type: "text",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

  motors: [

  {
    name: "motor_code",
    label: "Motor Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "motor_type",
    label: "Motor Type",
    type: "text",
    required: false,
  },

  {
    name: "kv_rating",
    label: "KV Rating",
    type: "number",
    required: false,
  },

  {
    name: "stator_size",
    label: "Stator Size",
    type: "text",
    required: false,
  },

  {
    name: "max_voltage",
    label: "Max Voltage",
    type: "text",
    required: false,
  },

  {
    name: "max_current_a",
    label: "Max Current (A)",
    type: "number",
    required: false,
  },

  {
    name: "shaft_diameter_mm",
    label: "Shaft Diameter (mm)",
    type: "number",
    required: false,
  },

  {
    name: "mounting_pattern",
    label: "Mounting Pattern",
    type: "text",
    required: false,
  },

  {
    name: "weight_g",
    label: "Weight (g)",
    type: "number",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

  frames: [

  {
    name: "frame_code",
    label: "Frame Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "frame_type",
    label: "Frame Type",
    type: "text",
    required: false,
  },

  {
    name: "material",
    label: "Material",
    type: "text",
    required: false,
  },

  {
    name: "wheelbase_mm",
    label: "Wheelbase (mm)",
    type: "number",
    required: false,
  },

  {
    name: "propeller_size_in",
    label: "Propeller Size (in)",
    type: "number",
    required: false,
  },

  {
    name: "stack_mounting",
    label: "Stack Mounting",
    type: "text",
    required: false,
  },

  {
    name: "camera_mount_size",
    label: "Camera Mount Size",
    type: "text",
    required: false,
  },

  {
    name: "weight_g",
    label: "Weight (g)",
    type: "number",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

  propellers: [

  {
    name: "prop_code",
    label: "Propeller Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "propeller_type",
    label: "Propeller Type",
    type: "text",
    required: false,
  },

  {
    name: "diameter_in",
    label: "Diameter (in)",
    type: "number",
    required: false,
  },

  {
    name: "pitch",
    label: "Pitch",
    type: "number",
    required: false,
  },

  {
    name: "blade_count",
    label: "Blade Count",
    type: "number",
    required: false,
  },

  {
    name: "material",
    label: "Material",
    type: "text",
    required: false,
  },

  {
    name: "mounting_type",
    label: "Mounting Type",
    type: "text",
    required: false,
  },

  {
    name: "rotation_direction",
    label: "Rotation Direction",
    type: "text",
    required: false,
  },

  {
    name: "weight_g",
    label: "Weight (g)",
    type: "number",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

  cameras: [

  {
    name: "camera_code",
    label: "Camera Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "camera_type",
    label: "Camera Type",
    type: "text",
    required: false,
  },

  {
    name: "sensor_type",
    label: "Sensor Type",
    type: "text",
    required: false,
  },

  {
    name: "resolution",
    label: "Resolution",
    type: "text",
    required: false,
  },

  {
    name: "video_system",
    label: "Video System",
    type: "text",
    required: false,
  },

  {
    name: "lens_size_mm",
    label: "Lens Size (mm)",
    type: "number",
    required: false,
  },

  {
    name: "field_of_view_deg",
    label: "Field Of View (deg)",
    type: "number",
    required: false,
  },

  {
    name: "interface_type",
    label: "Interface Type",
    type: "text",
    required: false,
  },

  {
    name: "mount_type",
    label: "Mount Type",
    type: "text",
    required: false,
  },

  {
    name: "weight_g",
    label: "Weight (g)",
    type: "number",
    required: false,
  },

  {
    name: "supported_drone_type",
    label: "Supported Drone Type",
    type: "text",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },
],

  esc: [

  {
    name: "esc_code",
    label: "ESC Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "esc_type",
    label: "ESC Type",
    type: "text",
    required: false,
  },

  {
    name: "continuous_current_a",
    label: "Continuous Current (A)",
    type: "number",
    required: false,
  },

  {
    name: "burst_current_a",
    label: "Burst Current (A)",
    type: "number",
    required: false,
  },

  {
    name: "input_voltage_range",
    label: "Input Voltage Range",
    type: "text",
    required: false,
  },

  {
    name: "bec_output",
    label: "BEC Output",
    type: "text",
    required: false,
  },

  {
    name: "firmware",
    label: "Firmware",
    type: "text",
    required: false,
  },

  {
    name: "telemetry_support",
    label: "Telemetry Support",
    type: "text",
    required: false,
  },

  {
    name: "mounting_pattern",
    label: "Mounting Pattern",
    type: "text",
    required: false,
  },

  {
    name: "weight_g",
    label: "Weight (g)",
    type: "number",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

chargers: [

  {
    name: "charger_code",
    label: "Charger Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "charger_type",
    label: "Charger Type",
    type: "text",
    required: false,
  },

  {
    name: "supported_chemistry",
    label: "Supported Chemistry",
    type: "text",
    required: false,
  },

  {
    name: "max_charge_power_w",
    label: "Max Charge Power (W)",
    type: "number",
    required: false,
  },

  {
    name: "input_voltage",
    label: "Input Voltage",
    type: "text",
    required: false,
  },

  {
    name: "output_current",
    label: "Output Current",
    type: "text",
    required: false,
  },

  {
    name: "balancer_type",
    label: "Balancer Type",
    type: "text",
    required: false,
  },

  {
    name: "port_type",
    label: "Port Type",
    type: "text",
    required: false,
  },

  {
    name: "supported_platform",
    label: "Supported Platform",
    type: "text",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },
],

gps_modules: [

  {
    name: "gps_code",
    label: "GPS Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "chipset",
    label: "Chipset",
    type: "text",
    required: false,
  },

  {
    name: "supported_gnss",
    label: "Supported GNSS",
    type: "text",
    required: false,
  },

  {
    name: "update_rate_hz",
    label: "Update Rate (Hz)",
    type: "number",
    required: false,
  },

  {
    name: "interface_type",
    label: "Interface Type",
    type: "text",
    required: false,
  },

  {
    name: "compass_included",
    label: "Compass Included",
    type: "text",
    required: false,
  },

  {
    name: "antenna_type",
    label: "Antenna Type",
    type: "text",
    required: false,
  },

  {
    name: "voltage_input",
    label: "Voltage Input",
    type: "text",
    required: false,
  },

  {
    name: "weight_g",
    label: "Weight (g)",
    type: "number",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

flight_controllers: [

  {
    name: "fc_code",
    label: "FC Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "processor_type",
    label: "Processor Type",
    type: "text",
    required: false,
  },

  {
    name: "gyro_model",
    label: "Gyro Model",
    type: "text",
    required: false,
  },

  {
    name: "firmware_support",
    label: "Firmware Support",
    type: "text",
    required: false,
  },

  {
    name: "uart_count",
    label: "UART Count",
    type: "number",
    required: false,
  },

  {
    name: "input_voltage_range",
    label: "Input Voltage Range",
    type: "text",
    required: false,
  },

  {
    name: "mounting_pattern",
    label: "Mounting Pattern",
    type: "text",
    required: false,
  },

  {
    name: "blackbox_support",
    label: "Blackbox Support",
    type: "text",
    required: false,
  },

  {
    name: "osd_support",
    label: "OSD Support",
    type: "text",
    required: false,
  },

  {
    name: "telemetry_support",
    label: "Telemetry Support",
    type: "text",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

video_transmitters: [

  {
    name: "vtx_code",
    label: "VTX Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "frequency_band",
    label: "Frequency Band",
    type: "text",
    required: false,
  },

  {
    name: "max_output_power_mw",
    label: "Max Output Power (mW)",
    type: "number",
    required: false,
  },

  {
    name: "channel_count",
    label: "Channel Count",
    type: "number",
    required: false,
  },

  {
    name: "video_format",
    label: "Video Format",
    type: "text",
    required: false,
  },

  {
    name: "antenna_connector",
    label: "Antenna Connector",
    type: "text",
    required: false,
  },

  {
    name: "input_voltage",
    label: "Input Voltage",
    type: "text",
    required: false,
  },

  {
    name: "mounting_pattern",
    label: "Mounting Pattern",
    type: "text",
    required: false,
  },

  {
    name: "weight_g",
    label: "Weight (g)",
    type: "number",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

radios_receivers: [

  {
    name: "radio_code",
    label: "Radio Code",
    type: "text",
    required: false,
  },

  {
    name: "manufacturer_name",
    label: "Manufacturer",
    type: "text",
    required: false,
  },

  {
    name: "sub_category",
    label: "Sub Category",
    type: "text",
    required: false,
  },

  {
    name: "radio_type",
    label: "Radio Type",
    type: "text",
    required: false,
  },

  {
    name: "frequency_band",
    label: "Frequency Band",
    type: "text",
    required: false,
  },

  {
    name: "channel_count",
    label: "Channel Count",
    type: "number",
    required: false,
  },

  {
    name: "protocol_support",
    label: "Protocol Support",
    type: "text",
    required: false,
  },

  {
    name: "telemetry_support",
    label: "Telemetry Support",
    type: "text",
    required: false,
  },

  {
    name: "range_km",
    label: "Range (km)",
    type: "number",
    required: false,
  },

  {
    name: "antenna_type",
    label: "Antenna Type",
    type: "text",
    required: false,
  },

  {
    name: "power_output_mw",
    label: "Power Output (mW)",
    type: "number",
    required: false,
  },

  {
    name: "intended_use",
    label: "Intended Use",
    type: "text",
    required: false,
  },

  {
    name: "compatible_drone_type",
    label: "Compatible Drone Type",
    type: "text",
    required: false,
  },
],

firmware: [

  {
    name: "firmware_code",
    label: "Firmware Code",
    type: "text",
    required: false,
  },

  {
    name: "firmware_name",
    label: "Firmware Name",
    type: "text",
    required: false,
  },

  {
    name: "category",
    label: "Category",
    type: "text",
    required: false,
  },

  {
    name: "purpose",
    label: "Purpose",
    type: "text",
    required: false,
  },

  {
    name: "license_type",
    label: "License Type",
    type: "text",
    required: false,
  },

  {
    name: "supported_hardware",
    label: "Supported Hardware",
    type: "text",
    required: false,
  },

  {
    name: "development_status",
    label: "Development Status",
    type: "text",
    required: false,
  },

  {
    name: "industry_adoption",
    label: "Industry Adoption",
    type: "text",
    required: false,
  },

  {
    name: "typical_use",
    label: "Typical Use",
    type: "text",
    required: false,
  },
],

software: [

  {
    name: "software_code",
    label: "Software Code",
    type: "text",
    required: false,
  },

  {
    name: "name",
    label: "Software Name",
    type: "text",
    required: false,
  },

  {
    name: "software_type",
    label: "Software Type",
    type: "text",
    required: false,
  },

  {
    name: "supported_platform",
    label: "Supported Platform",
    type: "text",
    required: false,
  },

  {
    name: "license_type",
    label: "License Type",
    type: "text",
    required: false,
  },

  {
    name: "connection_type",
    label: "Connection Type",
    type: "text",
    required: false,
  },

  {
    name: "development_status",
    label: "Development Status",
    type: "text",
    required: false,
  },

  {
    name: "primary_purpose",
    label: "Primary Purpose",
    type: "text",
    required: false,
  },
],
};

export default componentSchemas;