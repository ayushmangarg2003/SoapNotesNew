"use client";
import { useState, useRef, useEffect } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
import Modal from "@/components/Modal";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import FileUpload from "@/components/FileUpload";
import { createClient } from "@/libs/supabase/client";

// Initialize Supabase client
const supabase = createClient();

const initialPrompt = `You are an AI assistant that helps summarize doctor and patient conversations in a SOAP format like below:

Subjective. The subjective part details the observation of a healthcare provider of a patient. This could also include the observations verbally expressed by the patient. Some examples could be answers to questions like:

- Describe your symptoms in detail. When did they start, and how long have they been going on?
- What is the severity of your symptoms, and what makes them better or worse?
- What is your medical and mental health history?
- What other health-related issues are you experiencing?
- What medications are you taking?

Objective. All measurable data, such as vital signs, pulse rate, temperature, etc., are written here. It includes all the data that can be heard, seen, smelled, felt, and tasted as objective observations. If there are any changes in the patient’s data, it should be recorded here. This part of your SOAP note should consist of physical findings gathered during the session with your client. Some examples include:

- Vital signs
- Relevant medical records or information from other specialists
- The client’s appearance, behavior, and mood during the session

Note: This section should consist of factual information that you observe and should not include anything the patient has told you.

Assessment. This section combines all the information gathered from the subjective and objective sections. Here, you describe what you think is going on with the patient. You can include your impressions and interpretation of all the above information, and also draw from any clinical professional knowledge or DSM criteria/therapeutic models to arrive at a diagnosis (or list of possible diagnoses).

Plan. The plan refers to the treatment that the patient needs or is advised by the doctor. It may include additional lab tests to verify the findings. Any changes in the intervention should also be written here.

The SOAP note must be concise and well-written. Medical terminologies and jargon are allowed in the SOAP note.`;

export default function Dashboard() {
    const [isRecording, setIsRecording] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [PROMPT, setPROMPT] = useState(initialPrompt);
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');
    const [transcription, setTranscription] = useState("");
    const [soapNote, setSoapNote] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    const audioChunks = useRef([]);
    const mediaRecorder = useRef(null);

    // Fetch user and patient data on component mount
    useEffect(() => {
        const getUserAndPatients = async () => {
            // Fetch user data from Supabase
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                await fetchPatients(user.email);
            }

            setIsLoading(false); // Set loading to false once done
        };

        getUserAndPatients();
    }, []);

    // Fetch patients from Supabase filtered by email
    const fetchPatients = async (email) => {
        try {
            const { data, error } = await supabase
                .from('soap_notes')
                .select('*')
                .eq('email', email);

            if (error) {
                console.error('Error fetching patients:', error);
                setError('Failed to load patients.');
            } else {
                setPatients(data);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('Unexpected error occurred.');
        }
    };

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
        formData.append('file', audioBlob);

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
        setIsGenerating(true);

        if (isRecording || isTranscribing) {
            setIsGenerating(false);
            return;
        }

        const formData = new FormData();
        formData.append('transcribe', transcription);
        formData.append('prompt', PROMPT);

        try {
            const response = await fetch('/api/soapnote', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setSoapNote(data.soapnote.content);
            setIsModalOpen(true);
        } catch (error) {
            setError(error);
        } finally {
            setIsGenerating(false);
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
            {isLoading ? ( // Centered Loader for initial loading
                <div className="flex items-center justify-center w-full h-screen">
                    <Loader text="Getting things ready..." />
                </div>
            ) : (
                <>
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
                                    onChange={(e) => setTranscription(e.target.value)}
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
                                className={`flex items-center px-4 py-2 rounded-lg text-white font-bold transition-colors ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
                            >
                                {isRecording ? <FiMicOff className="mr-2" /> : <FiMic className="mr-2" />}
                                {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </button>
                        </div>

                        <FileUpload />
                    </section>

                    {isModalOpen && soapNote && (
                        <Modal isNewPatient={true} data={soapNote} time={new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '').replace(/\//g, '-').replace(/(\d{2})-(\d{2})-(\d{4})/, '$2-$1-$3') + ' CST'} closeModal={closeModal} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
                    )}

                    {isModalOpen && selectedPatient && (
                        <Modal isNewPatient={false} isApproved={selectedPatient.is_approved} data={selectedPatient.soap_note} time={selectedPatient.created_at} closeModal={closeModal} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
                    )}
                </>
            )}
        </main>
    );
}
