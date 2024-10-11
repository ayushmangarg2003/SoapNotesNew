"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FiX, FiEdit3, FiEye } from 'react-icons/fi'; // Icons for buttons
import { createClient } from "@/libs/supabase/client";

const Modal = ({ closeModal, data, time }) => {
  const [isEditMode, setIsEditMode] = useState(false); // Toggle between edit and preview mode
  const [editableData, setEditableData] = useState(data); // Editable state for SOAP note

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

  // Handle saving and closing the modal
  const handleSaveAndClose = () => {
    closeModal(); // Close the modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-[90%] h-[90%] rounded-lg py-0 px-6 relative overflow-y-auto shadow-lg">
        <div className="w-full h-[10%] flex justify-end gap-4 align-middle">
          {/* Save and Close button */}
          <button
            className="text-blue-600 hover:text-blue-800 font-bold"
            onClick={handleSaveAndClose}
          >
            Save and Close
          </button>

          {/* Toggle between Edit and Preview Mode */}
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? <FiEye size={24} /> : <FiEdit3 size={24} />}
          </button>

          {/* Close button */}
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={closeModal}
          >
            <FiX size={24} />
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
        <div className="w-full h-[10%] flex justify-between gap-4 align-baseline">
          <p>{`Approved by ${user}`}</p>
          <p>{time}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
