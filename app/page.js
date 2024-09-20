import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";
import Hero from "@/components/Hero";
import Header from "@/components/Header";

export default function Page() {
  const redirectLink = "http://localhost:3000/signin"
  return (
    <>
      <Header />
      <Hero
        heading={'Genesis Automation ✨'}
        description={'Genesis, your intelligent partner in healthcare automation. STOP TYPING, START TREATING...'}
        img="https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
        btnLink={redirectLink}
      />

    </>
  );
}
