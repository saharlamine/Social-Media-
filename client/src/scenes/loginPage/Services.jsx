import axios from "axios";

// Base URL from .env file
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Register a new user.
 * @param {Object} formData - The registration data including the image file.
 * @returns {Promise<Object>} - The server's response.
 */
export const registerUser = async (formData) => {
  try {
    const response = await apiClient.post("/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // For file uploads
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error.response?.data || "Registration failed";
  }
};

/**
 * Log in a user.
 * @param {Object} credentials - The user's email and password.
 * @returns {Promise<Object>} - The server's response containing user data and token.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error.response?.data || "Login failed";
  }
};
