import { useState, useEffect, useReducer } from "react";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import EventList from "./EventList";
import axiosInstance from "../axios";
import reducer, { initialState, actionTypes } from "../reducer";
import formatDate from "../utils/FormatDate";
import AddEventModal from "./AddEventModal";
import EditEventModal from "./EditEventModal";
import { Link } from "react-router-dom";
import { useStateValue } from "../StateProvider";

function Home() {
  // states
  // const [state, dispatch] = useReducer(reducer, initialState);
  const [{ events, toprankEntries, entries, specificEntries }, dispatch] =
    useStateValue();
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  //useEffects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, entriesResponse, toprankEntriesResponse] =
          await Promise.all([
            axiosInstance.get("/events/"),
            axiosInstance.get("/entries/"),
            axiosInstance.get("/topranks/"),
          ]);
        if (eventsResponse.data && Array.isArray(eventsResponse.data)) {
          dispatch({
            type: actionTypes.ADD_TO_EVENTS,
            payload: eventsResponse.data,
          });
        } else {
          console.error("Error fetching events: ", eventsResponse.data);
        }
        if (entriesResponse.data && Array.isArray(entriesResponse.data)) {
          dispatch({
            type: actionTypes.ADD_TO_ENTRIES,
            payload: entriesResponse.data,
          });
        } else {
          console.error("Error fetching entries: ", entriesResponse.data);
        }
        if (
          toprankEntriesResponse.data &&
          Array.isArray(toprankEntriesResponse.data)
        ) {
          dispatch({
            type: actionTypes.ADD_TO_TOPRANK_ENTRIES,
            payload: toprankEntriesResponse.data,
          });
        } else {
          console.error(
            "Error fetching toprank entries: ",
            toprankEntriesResponse.data
          );
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, [dispatch]);

  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     try {
  //       const response = await axiosInstance.get("/events");
  //       if (response.data && Array.isArray(response.data)) {
  //         dispatch({
  //           type: actionTypes.ADD_TO_EVENTS,
  //           payload: response.data,
  //         });
  //       } else {
  //         console.error("Unexpected data format: ", response.data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching events: ", error);
  //     }
  //   };
  //   fetchEvents();
  // }, []);

  // all functions for Event
  const handleShowAddEventModal = () => {
    setShowAddEventModal(!showAddEventModal);
  };
  const handleShowEditEventModal = (event) => {
    setSelectedEvent(event); // Set the event to be edited
    setShowEditEventModal(true); // Show the modal
  };

  // handle save functions
  const handleSaveEvent = async (data) => {
    // const whenWithSeconds = `${data.when}:00`;
    const eventData = {
      name: data.eventName,
      when: data.when,
      givenTake: data.givenTake,
    };

    try {
      const response = await axiosInstance.post("/events/", eventData);

      // Show success notification
      Swal.fire({
        icon: "success",
        title: "Data Saved!",
        text: "Data saved successfully.",
        timer: 5000, // Auto-close after 1.5 seconds
        showConfirmButton: true,
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.log("Error in adding event:", error);

      // Show error notification
      Swal.fire({
        icon: "error",
        title: "Save Failed!",
        text: "There was an error saving the data. Please try again.",
      });
    }
  };

  const handleEditEvent = (updatedEvent) => {
    axiosInstance
      .put(`/events/${updatedEvent.id}/`, updatedEvent)
      .then((response) => {
        // Show success notification
        Swal.fire({
          icon: "success",
          title: "Update Successful!",
          text: `${updatedEvent.eventName} Update Successfully.`,
          timer: 2000, // Auto-close after 2 seconds
          showConfirmButton: true,
        }).then(() => {
          window.location.reload();
        });
      });
  };

  const deleteEvent = (id) => {
    // Show a SweetAlert confirmation dialog
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform the delete request
        axiosInstance
          .delete(`/events/${id}/`)
          .then(() => {
            // Show a success alert after deletion
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Delete Successful.",
              timer: 1500, // Auto-close after 1.5 seconds
              showConfirmButton: true,
            }).then(() => {
              window.location.reload();
            });
          })
          .catch((error) => {
            console.error("Error in delete event: ", error);

            // Show an error alert
            Swal.fire({
              icon: "error",
              title: "Delete Failed!",
              text: "There was an error deleting the event. Please try again.",
            });
          });
      }
    });
  }; // all functions for event end
  return (
    <div className="container ">
      <div className="row d-flex align-items-center">
        {/* Buttons aligned to the right */}
        <div className="col d-flex justify-content-end">
          <button
            className="btn btn-md btn-primary me-2"
            onClick={handleShowAddEventModal}
          >
            Add Event
          </button>
        </div>
      </div>
      <br />
      <div className="row g-4">
        {events.map((event) => (
          <div className="col-sm-12 col-md-4" key={event.id}>
            <div className="card bg-dark text-light cursor-pointer d-flex h-100">
              <div className="card-body d-flex flex-column justify-content-between text-center">
                <div className="h1 mb-3">
                  <i className="bi bi-laptop"></i>
                </div>
                <h3 className="card-title mb-3">{event.name}</h3>

                <p className="card-text text-muted">
                  When: {formatDate(event.when)}
                </p>
                <div className="d-flex justify-content-center mt-auto">
                  <Link to={`/event/${event.id}`}>
                    <button className="btn btn-sm btn-primary me-2 d-flex align-items-center">
                      <FaEye className="me-2" />
                      View
                    </button>
                  </Link>

                  <button
                    className="btn btn-sm btn-warning me-2 d-flex align-items-center"
                    onClick={() => handleShowEditEventModal(event)}
                  >
                    <FaEdit className="me-2" />
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger d-flex align-items-center"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <FaTrashAlt className="me-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        show={showAddEventModal}
        onClose={handleShowAddEventModal}
        onSave={handleSaveEvent}
      />
      {/* Edit Event Modal */}
      <EditEventModal
        show={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        onSave={handleEditEvent}
        event={selectedEvent}
      />
    </div>
  );
}

export default Home;
