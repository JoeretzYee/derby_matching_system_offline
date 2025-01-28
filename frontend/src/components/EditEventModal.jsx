import React, { useEffect, useState } from "react";
import formatDateTime from "../utils/FormatDateEditEvent";

const EditEventModal = ({ show, onClose, onSave, event }) => {
  const [eventName, setEventName] = useState("");
  const [when, setWhen] = useState("");
  const [givenTake, setGivenTake] = useState("");
  console.log(event);
  useEffect(() => {
    if (event) {
      setEventName(event.name || "");
      setWhen(formatDateTime(event.when || "")); // Format the date correctly
      setGivenTake(event.givenTake || "");
    }
  }, [event]);

  const handleSave = () => {
    if (eventName.trim() && when.trim()) {
      onSave({
        id: event.id,
        name: eventName.trim(),
        when: when.trim(),
        givenTake: givenTake,
      });
      onClose();
    } else {
      alert("Please fill in all fields.");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Event</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Given Take</label>
              <input
                type="number"
                className="form-control"
                value={givenTake}
                onChange={(e) => setGivenTake(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Event Name</label>
              <input
                type="text"
                className="form-control"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">When</label>
              <input
                type="datetime-local"
                className="form-control"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
