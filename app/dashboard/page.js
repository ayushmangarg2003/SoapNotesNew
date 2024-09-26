"use client";  // This makes the component a Client Component
import { useState } from 'react';
import { FiMic, FiMicOff, FiMenu, FiX, FiMoreVertical } from 'react-icons/fi'; // Icons for buttons
import ButtonAccount from "@/components/ButtonAccount";

// Array of patients
const initialPatients = [
    { id: 1, name: "Michael Brown", details: 'Sample SOAP details for Michael' },
    { id: 2, name: "Sarah Johnson", details: 'Sample SOAP details for Sarah' },
    { id: 3, name: "Emily Davis", details: 'Sample SOAP details for Emily' },
    { id: 4, name: "John Smith", details: 'Sample SOAP details for John' },
];

// Default PROMPT value
const initialPrompt = "This is the default prompt. You can edit this by clicking the dropdown.";

export default function Dashboard() {
    const [isRecording, setIsRecording] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State to handle search
    const [selectedPatient, setSelectedPatient] = useState(null); // State for the selected patient
    const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
    const [PROMPT, setPROMPT] = useState(initialPrompt); // Variable to hold the PROMPT string
    const [isEditingPrompt, setIsEditingPrompt] = useState(false); // Toggle for showing the textarea
    const [patients, setPatients] = useState(initialPatients); // Patient state
    const [editingPatientId, setEditingPatientId] = useState(null); // Track which patient is being renamed
    const [newName, setNewName] = useState(""); // Temporary state to store the new name
    const [menuOpenId, setMenuOpenId] = useState(null); // Track which patient's menu is open

    // Function to toggle recording state
    const handleRecording = () => {
        setIsRecording(!isRecording);
    };

    // Function to toggle sidebar state
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Filter patients based on search query
    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Function to handle patient click
    const handlePatientClick = (patient) => {
        setSelectedPatient(patient); // Set the selected patient
        setIsModalOpen(true); // Open the modal
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null); // Clear the selected patient
    };

    // Function to handle prompt textarea toggle
    const togglePromptEdit = () => {
        setIsEditingPrompt(!isEditingPrompt);
    };

    // Handle prompt change from the textarea
    const handlePromptChange = (event) => {
        setPROMPT(event.target.value); // Update the PROMPT string
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

    // Handle delete patient
    const handleDelete = (patientId) => {
        const updatedPatients = patients.filter((patient) => patient.id !== patientId);
        setPatients(updatedPatients);
        setMenuOpenId(null); // Close the menu after delete
    };

    // Toggle the options menu (3 dots)
    const toggleMenu = (patientId) => {
        setMenuOpenId(menuOpenId === patientId ? null : patientId);
    };

    const getColor = (index) => {
        const colors = ["bg-blue-500", "bg-pink-500", "bg-green-500", "bg-yellow-500"];
        return colors[index % colors.length]; // Cycle through the color array
    };

    return (
        <main className="min-h-screen flex bg-blue-50 p-6 lg:p-3">
            {/* Hamburger Button for small screens */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg mt-2"
                onClick={toggleSidebar}
            >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
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

            {/* Main content area */}
            <section className="w-full lg:w-3/4 lg:pl-6 flex flex-col justify-between mt-16 lg:mt-0">
                {/* Text Area for unorganized text */}
                <div className="flex-1">
                    <label className="block text-lg font-medium">Give me unorganized text</label>
                    <textarea
                        className="w-full p-4 mt-2 border rounded-lg h-80 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Paste text here or record your conversation"
                    ></textarea>
                </div>

                {/* Dropdown for PROMPT Selection */}
                <div className="mt-6">
                    <label className="block text-lg font-medium mb-2">Edit Prompt</label>
                    <div className="relative">
                        {/* Dropdown button */}
                        <button
                            className="w-full p-4 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-left"
                            onClick={togglePromptEdit} // Toggle prompt editing (textarea)
                        >
                            {isEditingPrompt ? "Save and Close" : PROMPT }
                        </button>

                        {/* Textarea to edit PROMPT (conditionally rendered) */}
                        {isEditingPrompt && (
                            <textarea
                                className="w-full p-4 mt-2 border rounded-lg h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={PROMPT}
                                onChange={handlePromptChange} // Handle the updated value of PROMPT
                            ></textarea>
                        )}
                    </div>
                </div>

                {/* Generate SOAP Button and Start Recording */}
                <div className="flex justify-between items-center mt-6">
                    <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">
                        Generate SOAP
                    </button>

                    <button
                        onClick={handleRecording}
                        className={`flex items-center px-4 py-2 rounded-lg text-white font-bold transition-colors ${
                            isRecording ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                    >
                        {isRecording ? <FiMicOff className="mr-2" /> : <FiMic className="mr-2" />}
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                </div>

                {/* File Upload Section */}
                <div className="mt-6 border-dashed border-2 border-gray-400 rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-4">Please upload your desired SOAP format here</p>
                    <input
                        type="file"
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                    />
                </div>
            </section>

            {/* Modal for displaying SOAP details */}
            {isModalOpen && selectedPatient && (
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
                            <h2 className="text-2xl font-bold mb-2">{selectedPatient.name}</h2>
                        </div>

                        {/* SOAP Details */}
                        <div>
                            <h3 className="text-xl font-bold mb-2">SOAP Details</h3>
                            <p>{selectedPatient.details}</p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
