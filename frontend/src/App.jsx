import { useState, useEffect, useReducer } from "react";
// react router
import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./pages/Footer";
import Header from "./pages/Header";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import EventList from "./components/EventList";
import axiosInstance from "./axios";
import reducer, { initialState, actionTypes } from "./reducer";
import formatDate from "./utils/FormatDate";
import AddEventModal from "./components/AddEventModal";
import axios from "axios";
import EditEventModal from "./components/EditEventModal";
import Home from "./components/Home";
import { useStateValue } from "./StateProvider";

function App() {
  const [{ entries, events, toprankEntries }, dispatch] = useStateValue();
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />

      <br />
      <main className="flex-grow-1 flex-shrink-0 flex-auto">
        <Routes>
          <Route path="/event/:eventId" element={<EventList />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <br />
      <Footer />
    </div>
  );
}

export default App;
