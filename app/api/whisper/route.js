// /app/api/whisper/route.js
import { Configuration, OpenAIApi } from "openai";
import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, since we use formidable to handle form data
  },
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Helper function to convert buffer to a readable stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {}; // No-op
  readable.push(buffer);
  readable.push(null);
  return readable;
};

export async function POST(req) {
  const form = new formidable.IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form data:", err);
        reject(NextResponse.json({ error: "Form parsing error" }, { status: 500 }));
      }

      try {
        const file = files.audio;

        // Read the audio file as a buffer
        const buffer = await fs.promises.readFile(file.filepath);

        // Convert the buffer to a stream (because Whisper API expects a stream)
        const audioStream = bufferToStream(buffer);

        // Send the audio stream to OpenAI Whisper API
        const response = await openai.createTranscription(audioStream, "whisper-1");

        // Send the transcription result back
        resolve(NextResponse.json({ transcription: response.data.text }));
      } catch (error) {
        console.error("Error during transcription:", error);
        reject(NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 }));
      }
    });
  });
}
