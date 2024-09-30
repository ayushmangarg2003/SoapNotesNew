import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req) {

  const formData = await req.formData()
  const file = formData.get('file'); 

  // console.log(body);

  const translation = await openai.audio.translations.create({
    file: file,
    model: "whisper-1",
  });
  
  // const translation = {
  //   text:'hello'
  // }

  return NextResponse.json({ transcribe: translation.text });


  // try {

  //   return NextResponse.json({});
  // } catch (e) {
  //   return NextResponse.json({ error: e.message }, { status: 500 });
  // }
}






