// Replace with your machine's IP address if testing on a physical device.
// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
const DEV_IP = '192.168.1.64'; // Detected from ipconfig
const PORT = 3000;

const API_BASE_URL = `http://${DEV_IP}:${PORT}/api`;

export default {
    API_BASE_URL
};
