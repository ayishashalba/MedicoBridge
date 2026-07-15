import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import HeroSection from "../../components/HeroSection/HeroSection";
import SearchSection from "../../components/SearchSection/SearchSection";
import JoinSection from "../../components/JoinSection/JoinSection";
import WhyChoose from "../../components/WhyChoose/WhyChoose";
import TopDoctors from "../../components/TopDoctors/TopDoctors";
import TopHospitals from "../../components/TopHospitals/TopHospitals";
import Footer from "../../components/Footer/Footer";

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <HeroSection />
        <SearchSection />
        <JoinSection />
        <WhyChoose />
        <section id="find-doctors">
          <TopDoctors />
        </section>
        <section id="top-hospitals">
          <TopHospitals />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Landing;
