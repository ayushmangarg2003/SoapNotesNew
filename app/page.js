import Hero from "@/components/Hero";
import Header from "@/components/Header";
import FeaturesListicle from "@/components/FeaturesListicle";
import Footer from "@/components/Footer";

export default function Page() {
  const redirectLink = "/signin"
  return (
    <>
      <Header />
      <Hero
        heading={'Genesis Automation ✨'}
        description={'Genesis, your intelligent partner in healthcare automation. STOP TYPING, START TREATING...'}
        btnLink={redirectLink}
      />
      <FeaturesListicle />
      <Footer />
    </>
  );
}
