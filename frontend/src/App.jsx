import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <AppRoutes />
          <ToastContainer
            position="top-center"
            autoClose={1500}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </main>
      </div>
    </Router>
  );
}

export default App;
