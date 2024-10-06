import React from 'react'
import ButtonAccount from "@/components/ButtonAccount";
import { useState } from 'react';
import { FiMenu, FiX, FiMoreVertical } from 'react-icons/fi'; // Icons for buttons

const Sidebar = ({ patients, setPatients, handlePatientClick }) => {

    const [editingPatientId, setEditingPatientId] = useState(null); // Track which patient is being renamed
    const [menuOpenId, setMenuOpenId] = useState(null); // Track which patient's menu is open

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State to handle search
    const [newName, setNewName] = useState(""); // Temporary state to store the new name

    const getColor = (index) => {
        const colors = ["bg-blue-500", "bg-pink-500", "bg-green-500", "bg-yellow-500"];
        return colors[index % colors.length]; // Cycle through the color array
    };
    // Toggle the options menu (3 dots)
    const toggleMenu = (patientId) => {
        setMenuOpenId(menuOpenId === patientId ? null : patientId);
    };


    // Handle delete patient
    const handleDelete = (patientId) => {
        const updatedPatients = patients.filter((patient) => patient.id !== patientId);
        setPatients(updatedPatients);
        setMenuOpenId(null); // Close the menu after delete
    };

    // Handle renaming of the patient
    const handleRename = (patientId) => {
        const updatedPatients = patients.map((patient) =>
            patient.id === patientId ? { ...patient, name: newName } : patient
        );
        setPatients(updatedPatients);
        setEditingPatientId(null); // Close rename mode
        setNewName(""); // Clear the new name input
    };
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Hamburger Button for small screens */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg mt-2"
                onClick={toggleSidebar}
            >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <aside
                className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 fixed lg:relative top-0 left-0 z-40 w-[75vw] lg:w-1/4 bg-white p-4 rounded-lg shadow-lg h-full transition-transform duration-300 ease-in-out flex flex-col justify-between`}
                style={{ height: 'calc(100vh - 24px)' }} // Sidebar occupies 75% on small screens
            >
                {/* Account Button */}
                <div className="flex items-center justify-between mb-4">
                    <ButtonAccount />
                </div>

                {/* Search bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search Patient"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={searchQuery} // Bind search query to input
                        onChange={(e) => setSearchQuery(e.target.value)} // Update search state on input change
                    />
                </div>

                <h2 className="text-xl font-bold mb-4">Select Patient</h2>
                <ul className="overflow-y-auto flex-1">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient, index) => (
                            <li
                                key={patient.id}
                                className="mb-2 p-2 flex items-center rounded-lg shadow cursor-pointer hover:bg-gray-100 transition-colors"
                                style={{ backgroundColor: `${getColor(index).replace('-500', '-100')}` }}
                            >
                                <div
                                    className={`w-8 h-8 ${getColor(index)} text-white rounded-full flex justify-center items-center mr-4`}
                                >
                                    {patient.name.charAt(0)}
                                </div>
                                {/* If renaming, show input field with Save button */}
                                {editingPatientId === patient.id ? (
                                    <div className="flex items-center w-full">
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="border p-1 rounded-lg flex-grow"
                                            placeholder="Rename patient"
                                        />
                                        <button
                                            className="ml-2 text-blue-600 font-bold"
                                            onClick={() => handleRename(patient.id)}
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <span
                                        onClick={() => handlePatientClick(patient)} // Click handler to open modal
                                        className="flex-1"
                                    >
                                        {patient.name}
                                    </span>
                                )}
                                {/* 3-dot icon for options */}
                                <div className="relative">
                                    <FiMoreVertical
                                        className="ml-2 cursor-pointer"
                                        onClick={() => toggleMenu(patient.id)}
                                    />
                                    {menuOpenId === patient.id && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg z-10">
                                            <ul>
                                                <li
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => {
                                                        setEditingPatientId(patient.id);
                                                        setNewName(patient.name); // Set current name as default
                                                        setMenuOpenId(null); // Close the menu
                                                    }}
                                                >
                                                    Rename
                                                </li>
                                                <li
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                                                    onClick={() => handleDelete(patient.id)}
                                                >
                                                    Delete
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="text-center text-gray-500">No patients found</li>
                    )}
                </ul>

                {/* Record New SOAP Button */}
                <div className="mt-4">
                    <button className="bg-blue-500 text-white w-full px-4 py-2 rounded-lg hover:bg-blue-600 font-bold flex items-center justify-center">
                        Record New SOAP
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar