const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

export default {
    API_BASE_URL,
    CONTROLPORIA: true // Set to false to disable AI checks (e.g. no internet)
};
