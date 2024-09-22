"use client";  // This makes the component a Client Component
import { useState } from 'react';
import { FiMic, FiMicOff, FiMenu, FiX } from 'react-icons/fi'; // Icons for buttons
import ButtonAccount from "@/components/ButtonAccount";

// Array of patients
const patients = [
    { id: 1, name: "Michael Brown", age: 52, gender: "Male", color: "bg-blue-500" },
    { id: 2, name: "Sarah Johnson", age: 29, gender: "Female", color: "bg-pink-500" },
    { id: 3, name: "Emily Davis", age: 34, gender: "Female", color: "bg-green-500" },
    { id: 4, name: "John Smith", age: 45, gender: "Male", color: "bg-yellow-500" },
];

export const dynamic = "force-dynamic";

export default function Dashboard() {
    const [isRecording, setIsRecording] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Function to toggle recording state
    const handleRecording = () => {
        setIsRecording(!isRecording);
    };

    // Function to toggle sidebar state
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <main className="min-h-screen flex bg-blue-50 p-6 lg:p-3">
            {/* Hamburger Button for small screens */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-lg mt-2" // Added margin-top for small screens
                onClick={toggleSidebar}
            >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 fixed lg:relative top-0 left-0 z-40 w-[60vw] lg:w-1/4 bg-white p-4 rounded-lg shadow-lg h-full transition-transform duration-300 ease-in-out flex flex-col justify-between`} // Sidebar takes 60% width on small screens
                style={{ height: 'calc(100vh - 24px)' }} // Adjusts sidebar height for full screen with margins
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
                    />
                </div>

                <h2 className="text-xl font-bold mb-4">Select Patient</h2>
                <ul className="overflow-y-auto flex-1">
                    {patients.map((patient) => (
                        <li
                            key={patient.id}
                            className="mb-2 p-2 flex items-center rounded-lg shadow"
                            style={{ backgroundColor: `${patient.color.replace('-500', '-100')}` }}
                        >
                            <div
                                className={`w-8 h-8 ${patient.color} text-white rounded-full flex justify-center items-center mr-4`}
                            >
                                {patient.name.charAt(0)}
                            </div>
                            <span>
                                {patient.name} <span className="text-sm">({patient.age}, {patient.gender})</span>
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Record New SOAP Button */}
                <div className="mt-4">
                    <button className="bg-blue-500 text-white w-full px-4 py-2 rounded-lg hover:bg-blue-600 font-bold flex items-center justify-center">
                        Record New SOAP
                    </button>
                </div>
            </aside>

            {/* Overlay for smaller screens */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Main content area */}
            <section className="w-full lg:w-3/4 lg:pl-6 flex flex-col justify-between mt-16 lg:mt-0"> {/* Added margin-top for content on small screens */}
                {/* Text Area for unorganized text */}
                <div className="flex-1">
                    <label className="block text-lg font-medium">Give me unorganized text</label>
                    <textarea
                        className="w-full p-4 mt-2 border rounded-lg h-96 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Paste text here or record your conversation"
                    ></textarea>
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
        </main>
    );
}
