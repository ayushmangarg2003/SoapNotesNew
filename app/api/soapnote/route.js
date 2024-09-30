import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req) {

    const formData = await req.formData()
    const transcribe = formData.get('transcribe');
    const prompt = formData.get('prompt');

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: transcribe,
                },
            ],
        });

        return NextResponse.json({ soapnote: completion.choices[0].message });

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}