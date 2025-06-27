import React from 'react';
import ServicesHeroSection from '../../Components/ServicesHeroSection/ServicesHeroSection';
import ServicesSlider from '../../Components/ServicesSlider/ServicesSlider';
import ServicesCourse from '../../Components/ServicesCourse/ServicesCourse';
import ServicesContent from '../../Components/ServicesContent/ServicesContent';

const Services = () => {
  return (
        <div className="services-page">
            <ServicesHeroSection />
            <ServicesSlider />
            <ServicesCourse />
            <ServicesContent />
        </div>
    );
}

export default Services;