import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req) {

  const formData = await req.formData()
  const file = formData.get('file');

  // console.log(body);

  try {
    const translation = await openai.audio.translations.create({
      file: file,
      model: "whisper-1",
    });

    return NextResponse.json({ transcribe: translation.text });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}