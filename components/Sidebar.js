import React, { useEffect, useState } from 'react';
import ButtonAccount from "@/components/ButtonAccount";
import { FiMenu, FiX, FiMoreVertical } from 'react-icons/fi'; // Icons for buttons
import { createClient } from "@/libs/supabase/client"; // Supabase client

// Initialize Supabase client
const supabase = createClient();

const Sidebar = ({ patients, setPatients, handlePatientClick }) => {
    const [editingPatientId, setEditingPatientId] = useState(null); // Track which patient is being renamed
    const [menuOpenId, setMenuOpenId] = useState(null); // Track which patient's menu is open
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // State to handle search
    const [newName, setNewName] = useState(""); // Temporary state to store the new name
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
    const [patientToDelete, setPatientToDelete] = useState(null); // Store the patient to be deleted


    const getColor = (index) => {
        const colors = ["bg-blue-500", "bg-pink-500", "bg-green-500", "bg-yellow-500"];
        return colors[index % colors.length]; // Cycle through the color array
    };

    const toggleMenu = (patientId) => {
        setMenuOpenId(menuOpenId === patientId ? null : patientId);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const filteredPatients = patients.filter((patient) =>
        patient?.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handlePatientsUpdate = (event) => {
            setPatients(event.detail); // Update patients with new data
        };

        window.addEventListener("patientsUpdated", handlePatientsUpdate);

        return () => {
            window.removeEventListener("patientsUpdated", handlePatientsUpdate);
        };
    }, []);


    // Handle delete confirmation
    const handleDeleteConfirmation = (patientId) => {
        setPatientToDelete(patientId); // Set the patient to be deleted
        setIsConfirmOpen(true); // Open confirmation modal
    };

    // Confirm delete action
    const confirmDelete = () => {
        if (patientToDelete !== null) {
            handleDelete(patientToDelete);
        }
        setIsConfirmOpen(false); // Close confirmation modal
        setPatientToDelete(null); // Reset patient to delete
    };

    // Cancel delete action
    const cancelDelete = () => {
        setIsConfirmOpen(false); // Close confirmation modal
        setPatientToDelete(null); // Reset patient to delete
    };

    // Delete patient from Supabase and update local state
    const handleDelete = async (patientId) => {
        try {
            // Delete from Supabase
            const { error } = await supabase
                .from('soap_notes')
                .delete()
                .eq('id', patientId);

            if (error) {
                console.error('Error deleting patient:', error);
                return;
            }

            // Update local state after successful deletion
            const updatedPatients = patients.filter((patient) => patient.id !== patientId);
            setPatients(updatedPatients);
            setMenuOpenId(null); // Close the menu after delete
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    // Update patient name in Supabase and local state
    const handleRename = async (patientId) => {
        if (!newName.trim()) return; // Prevent empty names

        try {
            // Update in Supabase
            const { error } = await supabase
                .from('soap_notes')
                .update({ patient_name: newName })
                .eq('id', patientId);

            if (error) {
                console.error('Error updating patient name:', error);
                return;
            }

            // Update local state after successful update
            const updatedPatients = patients.map((patient) =>
                patient.id === patientId ? { ...patient, patient_name: newName } : patient
            );
            setPatients(updatedPatients);

            setEditingPatientId(null); // Close rename mode
            setNewName(""); // Clear the new name input
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    const startMeet = () => {
        const uniqueID = Math.random().toString(36).substr(2, 9); // Generate unique ID
        window.location.href = `/meet/${uniqueID}`; // Redirect to /meet/{ID} using window.location
    }

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
                className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 fixed lg:relative top-0 left-0 z-40 w-[75vw] lg:w-1/4 bg-white p-4 rounded-lg shadow-lg h-full transition-transform duration-300 ease-in-out flex flex-col justify-between`}
                style={{ height: 'calc(100vh - 24px)' }} // Sidebar occupies 75% on small screens
            >
                <div className="flex items-center justify-between mb-4">
                    <ButtonAccount />
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search Patient"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                    {patient.patient_name.charAt(0)}
                                </div>
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
                                        onClick={() => handlePatientClick(patient)}
                                        className="flex-1"
                                    >
                                        {patient.patient_name}
                                    </span>
                                )}
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
                                                        setNewName(patient.patient_name);
                                                        setMenuOpenId(null);
                                                    }}
                                                >
                                                    Rename
                                                </li>
                                                <li
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                                                    onClick={() => handleDeleteConfirmation(patient.id)}
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

                <div className="mt-4">
                    <button onClick={startMeet} className="bg-blue-500 text-white w-full px-4 py-2 rounded-lg hover:bg-blue-600 font-bold flex items-center justify-center">
                        Start New Meeting
                    </button>
                </div>
            </aside>

            {/* Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded-lg"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
