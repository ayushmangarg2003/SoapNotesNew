"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FiEdit3, FiEye } from "react-icons/fi";
import { createClient } from "@/libs/supabase/client";

const Modal = ({ isApproved: parentIsApproved, closeModal, data, time, isNewPatient }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableData, setEditableData] = useState(data);
  const [showPopup, setShowPopup] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isApproved, setIsApproved] = useState(false); // Local state for checkbox

  const supabase = createClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, [supabase]);

  // Set the value of isApproved from the parent or default to false
  useEffect(() => {
    if (typeof parentIsApproved !== "undefined") {
      setIsApproved(parentIsApproved); // Use the value passed from the parent
    } else {
      setIsApproved(false); // Default to false if not provided
    }
  }, [parentIsApproved]);

  // Fetch updated patient data from Supabase
  const fetchUpdatedPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("soap_notes")
        .select("*")
        .eq("email", user?.email);

      if (error) {
        console.error("Error fetching updated patients:", error.message);
        return;
      }

      const updateEvent = new CustomEvent("patientsUpdated", { detail: data });
      window.dispatchEvent(updateEvent);
    } catch (error) {
      console.error("Error fetching patients:", error.message);
    }
  };

  // Handle saving the data to Supabase and closing the modal
  const handleSaveData = async () => {
    if (isNewPatient && !patientName) {
      alert("Please enter the patient's name.");
      return;
    }

    setIsSaving(true);

    try {
      if (isNewPatient) {
        // Insert new patient data
        const { error } = await supabase.from("soap_notes").insert([
          {
            patient_name: patientName,
            soap_note: editableData,
            created_at: new Date(),
            email: user?.email,
            is_approved: isApproved, // Include isApproved in insert
          },
        ]);

        if (error) {
          throw error;
        }

        await fetchUpdatedPatients();
      } else {
        // Update existing patient data
        const { error } = await supabase
          .from("soap_notes")
          .update({
            soap_note: editableData,
            is_approved: isApproved, // Include isApproved in update
          })
          .eq("soap_note", data);

        if (error) {
          throw error;
        }

        await fetchUpdatedPatients();
      }

      closeModal();
    } catch (error) {
      console.error("Error saving data:", error.message);
    } finally {
      setIsSaving(false);
      setShowPopup(false);
    }
  };

  // Handle showing the popup or directly saving based on isNewPatient flag
  const handleSaveClick = async () => {
    if (isNewPatient) {
      setShowPopup(true);
    } else {
      await handleSaveData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-[90%] h-[90%] rounded-lg py-0 px-6 relative overflow-y-auto shadow-lg">
        <div className="w-full h-[10%] flex justify-end gap-4 align-middle">
          {/* Save and Close button */}
          <button
            className="text-blue-600 hover:text-blue-800 font-bold"
            onClick={handleSaveClick}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save and Close"}
          </button>

          {/* Toggle between Edit and Preview Mode */}
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? <FiEye size={24} /> : <FiEdit3 size={24} />}
          </button>
        </div>

        {/* SOAP Details */}
        <div className="h-[80%]">
          <h3 className="text-xl font-bold mb-2">SOAP Details</h3>

          {/* Conditional rendering based on edit mode */}
          {isEditMode ? (
            <textarea
              value={editableData}
              onChange={(e) => setEditableData(e.target.value)}
              className="w-full h-5/6 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <ReactMarkdown className="prose max-w-none">{editableData}</ReactMarkdown>
          )}
        </div>
        <div className="w-full h-[10%] flex justify-between items-center gap-4 align-baseline">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isApproved}
              onChange={() => setIsApproved(!isApproved)}
            />
            {`Approved by ${user?.email}`}
          </label>
          <p>{time}</p>
        </div>
      </div>

      {/* Popup for asking patient's name only if isNewPatient is true */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[50%]">
            <h2 className="text-xl font-bold mb-4">Enter Name of Patient</h2>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="input input-bordered w-full mb-4"
              placeholder="Patient's Name"
            />
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPopup(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveData}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
