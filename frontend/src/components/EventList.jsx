import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import axiosInstance from "../axios";
import { actionTypes } from "../reducer";
import { useStateValue } from "../StateProvider";
import AddEntryModal from "./AddEntryModal";
import TabsList from "./TabsList";

function EventList() {
  const { eventId } = useParams();
  const [{ entries, toprankEntries, eventDetail }, dispatch] = useStateValue();
  const [specificEntries, setSpecificEntries] = useState([]);
  const [specificToprankEntries, setSpecificToprankEntries] = useState([]);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [isStagInEvent, setIsStagInEvent] = useState("");
  const [isBullstagInEvent, setIsBullstagInEvent] = useState("");
  const [isCockInEvent, setIsCockInEvent] = useState("");
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [selectedEntry1, setSelectedEntry1] = useState(null);
  const [selectedEntry2, setSelectedEntry2] = useState(null);
  const [excludedPairs, setExcludedPairs] = useState([]);
  const [entryOptions, setEntryOptions] = useState([]);

  console.log(`type eventId: ${typeof eventId}`);

  const getMaxEntriesFromEventName = (eventName) => {
    const match = eventName.match(/^\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };
  const maxEntries =
    eventDetail && eventDetail.name
      ? getMaxEntriesFromEventName(eventDetail.name)
      : 0;

  const entryOptionss = async () => {
    try {
      // Fetch entries from the `/entries` endpoint
      const entriesResponse = await axiosInstance.get("/entries");
      const entriesData = entriesResponse.data.map((entry) => ({
        value: entry.entry_name,
        label: entry.entry_name,
      }));

      // Fetch entries from the `/topranks` endpoint
      const toprankResponse = await axiosInstance.get("/topranks");
      const toprankData = toprankResponse.data.map((toprank) => ({
        value: toprank.entry_name, // Assuming `entry_name` is the property you want to use
        label: toprank.entry_name,
      }));

      // Combine both entries and toprankEntries
      const combinedEntries = [...entriesData, ...toprankData];

      setEntryOptions(combinedEntries); // Set the combined entries into the state
    } catch (error) {
      console.error("Error fetching entries:", error);
      return [];
    }
  };

  // Fetch entry options when the component mounts
  useEffect(() => {
    entryOptionss(); // Call the async function to load entries
  }, []);

  useEffect(() => {
    if (eventId) {
      axiosInstance
        .get(`/events/${eventId}/`)
        .then((response) => {
          if (response.data.name) {
            if (/stag/i.test(response.data.name)) setIsStagInEvent("stag");
            if (/bullstag/i.test(response.data.name))
              setIsBullstagInEvent("bullstag");
            if (/cock/i.test(response.data.name)) setIsCockInEvent("cock");
          } else {
            alert("No stag,bullstag,cock in Event");
          }

          dispatch({
            type: actionTypes.SET_EVENT_DETAIL,
            payload: response.data,
          });
        })
        .catch((error) => {
          console.error("Error fetching event detail: ", error);
        });

      axiosInstance.get(`/entries/?event_id=${eventId}`).then((response) => {
        setSpecificEntries(response.data);
      });
      axiosInstance.get(`/topranks/?event_id=${eventId}`).then((response) => {
        setSpecificToprankEntries(response.data);
      });
    }
  }, [eventId, dispatch]);

  const handleExcludeSubmit = async () => {
    if (!selectedEntry1 || !selectedEntry2) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Selection",
        text: "Please select both entries to exclude.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check if the same entry is selected for both
    if (selectedEntry1.value === selectedEntry2.value) {
      Swal.fire({
        icon: "error",
        title: "Invalid Selection",
        text: "You cannot exclude the same entry as both Entry 1 and Entry 2.",
        confirmButtonText: "OK",
      });
      return;
    }
    // Fetch the excluded entries from the `/excluded` API endpoint
    const response = await axiosInstance.get(`/excluded/`, {
      params: { event_id: eventId }, // Pass eventId as query parameter
    });
    const excludedEntries = response.data; // Assume the API returns an array of excluded entries
    let isAlreadyExcluded = false;
    // Check if the selected entries are already excluded
    excludedEntries.forEach((excluded) => {
      const excludedPairs = excluded.excluded || [];
      excludedPairs.forEach((pair) => {
        const isMatch =
          (pair.entry1 === selectedEntry1.value &&
            pair.entry2 === selectedEntry2.value) ||
          (pair.entry1 === selectedEntry2.value &&
            pair.entry2 === selectedEntry1.value); // Check both orders
        if (isMatch) {
          isAlreadyExcluded = true;
        }
      });
    });

    if (isAlreadyExcluded) {
      Swal.fire({
        icon: "info",
        title: "Already Excluded",
        text: "These entries are already excluded.",
        confirmButtonText: "OK",
      });
      return;
    }

    // Prepare the new exclusion data
    const excludedData = {
      event_id: eventId, // Replace with your event ID
      excluded: [
        {
          entry1: selectedEntry1.value, // Assuming Select provides an object with `value`
          entry2: selectedEntry2.value,
        },
      ],
    };

    try {
      // Add the new exclusion using the `/excluded` API
      await axiosInstance.post(`/excluded/`, excludedData);

      Swal.fire({
        icon: "success",
        title: "Entries Excluded",
        text: "The selected entries have been excluded successfully.",
        timer: 1500,
        showConfirmButton: true,
      }).then(() => {
        window.location.reload();
      });

      // Reset states and close modal
      setShowExcludeModal(false);
      setSelectedEntry1(null);
      setSelectedEntry2(null);
    } catch (error) {
      console.error("Error excluding entries:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to exclude entries. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  // all functions for add entry modal
  const handleShowAddEntryModal = () => {
    setShowAddEntryModal(!showAddEntryModal);
  };

  const addEntryModal = (data) => {
    const modelName = data.isToprankChecked ? "topranks" : "entries";
    const entryData = {
      entry_name: data.entryName,
      owner_name: data.ownerName,
      address: data.address,
      is_toprank: data.isToprankChecked,
      chicken_entries: data.chickenEntries,
      event_id: eventDetail.id,
    };
    axiosInstance
      .post(`/${modelName}/`, entryData)
      .then((response) => {
        dispatch({
          type: actionTypes.ADD_TO_ENTRIES,
          payload: [response.data],
        });

        Swal.fire({
          icon: "success",
          title: "Add Entry Successful!",
          text: `Entry Name: ${data.entryName}${
            data.isToprankChecked ? " (Top Rank)" : ""
          }`,
          timer: 2000, // Auto-close after 2 seconds
          showConfirmButton: true,
        }).then(() => {
          window.location.reload();
        });
        setShowAddEntryModal(false);
      })
      .catch((error) => {
        console.error("Error adding entry:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add the data entries. Please try again.",
        });
      });
  };

  if (!eventDetail) return <div>Loading...</div>;
  return (
    <div className="container">
      <div className=" d-flex align-items-center justify-content-between ">
        {" "}
        <Link to="/">
          <button className="btn btn-md btn-secondary">Back</button>
        </Link>
        <h1 className="text-center text-dark">{eventDetail.name}</h1>
        <div className="d-flex gap-2">
          <button
            onClick={() => setShowExcludeModal(true)}
            className="btn btn-md btn-dark"
          >
            Exclude
          </button>
          <button
            className="btn btn-md btn-primary w-auto"
            onClick={handleShowAddEntryModal}
          >
            Add Entry
          </button>
        </div>
        {/* Add Entry Modal */}
        <AddEntryModal
          show={showAddEntryModal}
          onClose={handleShowAddEntryModal}
          onSave={addEntryModal}
          maxEntries={maxEntries}
          stag={isStagInEvent}
          bullstag={isBullstagInEvent}
          cock={isCockInEvent}
        />
        {/* Exclude Modal */}
        {showExcludeModal && (
          <div className="modal d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Exclude Entries</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowExcludeModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Select Entry 1</label>
                    <Select
                      // options={entryOptions}
                      value={selectedEntry1}
                      onChange={setSelectedEntry1}
                      placeholder="Select an entry"
                    />
                  </div>
                  <div className="mb-3">
                    <label>Select Entry 2</label>
                    <Select
                      // options={entryOptions}
                      value={selectedEntry2}
                      onChange={setSelectedEntry2}
                      placeholder="Select an entry"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      // setShowExcludeModal(false); // Close the modal
                      window.location.reload(); // Refresh the page
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleExcludeSubmit}
                  >
                    Exclude
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <TabsList
        specificEntries={specificEntries}
        specificToprankEntries={specificToprankEntries}
        eventId={eventId}
      />
      {/* Exclude Modal */}
      {showExcludeModal && (
        <div className="modal d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Exclude Entries</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowExcludeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Select Entry 1</label>
                  <Select
                    options={entryOptions}
                    value={selectedEntry1}
                    onChange={setSelectedEntry1}
                    placeholder="Select an entry"
                  />
                </div>
                <div className="mb-3">
                  <label>Select Entry 2</label>
                  <Select
                    options={entryOptions}
                    value={selectedEntry2}
                    onChange={setSelectedEntry2}
                    placeholder="Select an entry"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowExcludeModal(false); // Close the modal
                    window.location.reload(); // Refresh the page
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExcludeSubmit}
                >
                  Exclude
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventList;
