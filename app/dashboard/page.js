"use client";  
import { useState, useRef } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi'; 
import Modal from "@/components/Modal";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import FileUpload from "@/components/FileUpload"; // Import the FileUpload component

const initialPatients = [
    { id: 1, name: "Michael Brown", details: 'Sample SOAP details for Michael' },
    { id: 2, name: "Sarah Johnson", details: 'Sample SOAP details for Sarah' },
    { id: 3, name: "Emily Davis", details: 'Sample SOAP details for Emily' },
    { id: 4, name: "John Smith", details: 'Sample SOAP details for John' },
];

const initialPrompt = `You are an AI assistant that helps summarize doctor and patient conversations in a SOP format`;

export default function Dashboard() {
    const [isRecording, setIsRecording] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [PROMPT, setPROMPT] = useState(initialPrompt); 
    const [isEditingPrompt, setIsEditingPrompt] = useState(false); 
    const [patients, setPatients] = useState(initialPatients); 
    const [error, setError] = useState('')
    const [transcription, setTranscription] = useState(""); 
    const [soapNote, setSoapNote] = useState(""); 
    const [isTranscribing, setIsTranscribing] = useState(false); 
    const audioChunks = useRef([]); 
    const mediaRecorder = useRef(null); 

    const handleRecording = () => {
        if (isRecording) {
            mediaRecorder.current.stop();
        } else {
            startRecording();
        }
        setIsRecording(!isRecording);
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = []; 

        mediaRecorder.current.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = async () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
            await sendAudioForTranscription(audioBlob);
        };

        mediaRecorder.current.start();
    };

    const sendAudioForTranscription = async (audioBlob) => {
        setIsTranscribing(true); 

        const formData = new FormData();
        formData.append('file', audioBlob)

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setTranscription(data.transcribe);  
        } catch (error) {
            console.error('Error transcribing the audio:', error);
        } finally {
            setIsTranscribing(false);  
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
            setSoapNote(data.soapnote.content);  
            setIsModalOpen(true)
        } catch (error) {
            setError(error)
        } finally {
            setIsGenerating(false)
        }
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient); 
        setIsModalOpen(true); 
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null); 
    };

    const togglePromptEdit = () => {
        setIsEditingPrompt(!isEditingPrompt);
    };

    const handlePromptChange = (event) => {
        setPROMPT(event.target.value); 
    };

    return (
        <main className="min-h-screen flex bg-blue-50 p-6 lg:p-3">
            <Sidebar patients={patients} setPatients={setPatients} handlePatientClick={handlePatientClick} />

            <section className="w-full lg:w-3/4 lg:pl-6 flex flex-col justify-between mt-16 lg:mt-0">
                <div className="flex-1">
                    <label className="block text-lg font-medium">Transcription</label>
                    {isTranscribing ? (
                        <Loader text="Transcribing audio..." />
                    ) : (
                        <textarea
                            className="w-full p-4 mt-2 border rounded-lg h-80 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your transcription will appear here..."
                            value={transcription || ""}
                            onChange={(e) => (setTranscription(e.target.value))}
                        ></textarea>
                    )}
                </div>

                <div className="mt-6">
                    <label className="block text-lg font-medium mb-2">Edit Prompt</label>
                    <div className="relative">
                        <button
                            className="w-full p-4 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-left line-clamp-2"
                            onClick={togglePromptEdit} 
                        >
                            {isEditingPrompt ? "Save and Close" : PROMPT}
                        </button>

                        {isEditingPrompt && (
                            <textarea
                                className="w-full p-4 mt-2 border rounded-lg h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={PROMPT}
                                onChange={handlePromptChange} 
                            ></textarea>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <button onClick={handleGenerateSoap} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">
                        {isGenerating ? "Generating..." : "Generate SOAP"}
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

                {/* Use FileUpload Component */}
                <FileUpload />
            </section>

            {
                isModalOpen && soapNote && (
                    <Modal data={soapNote} closeModal={closeModal} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
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
