/**
 * Global Configuration for MedicoBridge Frontend
 *
 * ENABLE_BACKEND_API: Toggle backend integration.
 * Set to `false` for 100% standalone frontend mode (uses local state & mock data).
 * Set to `true` when backend server (e.g. Express/Node) is active on API_BASE_URL.
 */
export const ENABLE_BACKEND_API = false;
export const API_BASE_URL = "http://localhost:5000/api";
