"use client";

import { Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FiX } from 'react-icons/fi'; // Icons for buttons

// A simple modal component which can be shown/hidden with a boolean and a function
// Because of the setIsModalOpen function, you can't use it in a server component.
const Modal = ({ isModalOpen, setIsModalOpen, closeModal, data }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-[90%] h-[90%] rounded-lg p-6 relative overflow-y-auto shadow-lg">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={closeModal}
        >
          <FiX size={24} />
        </button>

        {/* Patient details */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2"></h2>
        </div>

        {/* SOAP Details */}
        <div>
          <h3 className="text-xl font-bold mb-2">SOAP Details</h3>
          <p>{data}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
