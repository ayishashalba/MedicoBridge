import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import HeroSection from "../../components/HeroSection/HeroSection";
import JoinSection from "../../components/JoinSection/JoinSection";
import WhyChoose from "../../components/WhyChoose/WhyChoose";
import TopDoctors from "../../components/TopDoctors/TopDoctors";
import TopHospitals from "../../components/TopHospitals/TopHospitals";
import Footer from "../../components/Footer/Footer";
import DepartmentsSection from "../../components/DepartmentsSection/DepartmentsSection";
import ReviewsSection from "../../components/ReviewsSection/ReviewsSection";

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        <section id="join">
          <JoinSection />
        </section>
        <section id="about">
          <WhyChoose />
        </section>
        <DepartmentsSection />
        <section id="find-doctors">
          <TopDoctors />
        </section>
        <section id="hospitals">
          <TopHospitals />
        </section>
        <ReviewsSection />
      </main>
      <section id="contact">
        <Footer />
      </section>
    </div>
  );
}

export default Landing;
