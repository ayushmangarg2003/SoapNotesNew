"use client";  // This makes the component a Client Component
import { useState, useRef } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi'; // Icons for buttons
import Modal from "@/components/Modal";
import Sidebar from "@/components/Sidebar";

// Array of patients
const initialPatients = [
    { id: 1, name: "Michael Brown", details: 'Sample SOAP details for Michael' },
    { id: 2, name: "Sarah Johnson", details: 'Sample SOAP details for Sarah' },
    { id: 3, name: "Emily Davis", details: 'Sample SOAP details for Emily' },
    { id: 4, name: "John Smith", details: 'Sample SOAP details for John' },
];

// Default PROMPT value
const initialPrompt = `You are an AI assistant that helps summarize doctor and patient conversations in a SOP format like below:
Subjective.The subjective part details the observation of a health care provider to a patient.This could also be the observations that are verbally expressed by the patient.some examples could be answers to questions like:

- Describe your symptoms in detail.When did they start and how long have they been going on ?
- What is the severity of your symptoms and what makes them better or worse ?
- What is your medical and mental health history ?
- What other health - related issues are you experiencing ?
- What medications are you taking ?

Objective.All measurable data such as vital signs, pulse rate, temperature, etc.are written here.It means that all the data that you can hear, see, smell, feel, and taste are objective observations.If there are any changes regarding of the patient’s data, it will also be written here.This part of your SOAP note should be made up of physical findings gathered from the session with your client.Some examples include:

- Vital signs
- Relevant medical records or information from from other specialists
- The client’s appearance, behavior, and mood in session.Note: This section should consist of factual information that you observe and not include anything the patient has told you.

This section combines all the information gathered from the subjective and objective sections.It’s where you describe what you think is going on with the patient.

Assessment:
You can include your impressions and your interpretation of all of the above information, and also draw from any clinical professional knowledge or DSM criteria / therapeutic models to arrive at a diagnosis(or list of possible diagnoses).
    Plan.The plan refers to the treatment that the patient need or advised by the doctor.Such as additional lab test to verify the findings.The changes in the intervention are also written here.
The SOAP note must be concise and well - written. 
Medical terminologies and jargon are allowed in the SOAP note.`;

export default function Dashboard() {
    const [isRecording, setIsRecording] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null); // State for the selected patient
    const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
    const [PROMPT, setPROMPT] = useState(initialPrompt); // Variable to hold the PROMPT string
    const [isEditingPrompt, setIsEditingPrompt] = useState(false); // Toggle for showing the textarea
    const [patients, setPatients] = useState(initialPatients); // Patient state
    const [error, setError] = useState('')
    const [transcription, setTranscription] = useState(""); // State for holding transcription text
    const [soapNote, setSoapNote] = useState(""); // State for holding transcription text
    const [isTranscribing, setIsTranscribing] = useState(false); // State to indicate if transcription is in progress
    const audioChunks = useRef([]); // Store audio chunks
    const mediaRecorder = useRef(null); // Store the MediaRecorder instance

    // Function to toggle recording state
    const handleRecording = () => {
        if (isRecording) {
            // Stop the recording
            mediaRecorder.current.stop();
        } else {
            // Start the recording
            startRecording();
        }
        setIsRecording(!isRecording);
    };

    // Function to start recording
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = []; // Clear the audio chunks for the next recording

        // Push audio data chunks into the audioChunks array
        mediaRecorder.current.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
        };

        // On stop, send the audio for transcription
        mediaRecorder.current.onstop = async () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
            await sendAudioForTranscription(audioBlob);
        };

        mediaRecorder.current.start();
    };

    // Function to send the recorded audio for transcription
    const sendAudioForTranscription = async (audioBlob) => {
        setIsTranscribing(true); // Show that transcription is in progress

        const formData = new FormData();
        formData.append('file', audioBlob)

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setTranscription(data.transcribe);  // Set the transcription result

        } catch (error) {
            console.error('Error transcribing the audio:', error);
        } finally {
            setIsTranscribing(false);  // Stop showing progress
        }
    };

    const handleGenerateSoap = async () => {
        setIsGenerating(true)
        if (isRecording || isTranscribing) {
            setIsGenerating(false)
            return
        }

        const formData = new FormData();
        formData.append('transcribe', transcription)
        formData.append('prompt', PROMPT)

        try {
            const response = await fetch('/api/soapnote', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setSoapNote(data.soapnote.content);  // Set the transcription result
            setIsModalOpen(true)
        } catch (error) {
            setError(error)
        } finally {
            setIsGenerating(false)
        }
    }

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





    return (
        <main className="min-h-screen flex bg-blue-50 p-6 lg:p-3">
            {/* Sidebar */}
            <Sidebar patients={patients} setPatients={setPatients} handlePatientClick={handlePatientClick} />

            {/* Main content area */}
            <section className="w-full lg:w-3/4 lg:pl-6 flex flex-col justify-between mt-16 lg:mt-0">
                {/* Text Area for unorganized text */}
                <div className="flex-1">
                    <label className="block text-lg font-medium">Transcription</label>
                    <textarea
                        className="w-full p-4 mt-2 border rounded-lg h-80 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your transcription will appear here..."
                        value={transcription || ""}
                        onChange={(e) => (setTranscription(e.target.value))}
                    ></textarea>
                </div>

                {/* Dropdown for PROMPT Selection */}
                <div className="mt-6">
                    <label className="block text-lg font-medium mb-2">Edit Prompt</label>
                    <div className="relative">
                        {/* Dropdown button */}
                        <button
                            className="w-full p-4 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-left line-clamp-2"
                            onClick={togglePromptEdit} // Toggle prompt editing (textarea)
                        >
                            {isEditingPrompt ? "Save and Close" : PROMPT}
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
                    <button onClick={handleGenerateSoap} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">
                        Generate SOAP
                    </button>

                    <button
                        onClick={handleRecording}
                        className={`flex items-center px-4 py-2 rounded-lg text-white font-bold transition-colors ${isRecording ? 'bg-red-500' : 'bg-blue-500'
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

            {
                isModalOpen && soapNote && (
                    <Modal soapNote={soapNote} closeModal={closeModal} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
                )
            }

            {
                isModalOpen && selectedPatient && (
                    <Modal data={selectedPatient.details} closeModal={closeModal} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
                )
            }
        </main >
    );
}
