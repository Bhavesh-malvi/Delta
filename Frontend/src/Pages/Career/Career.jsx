import React from 'react';
import CareerHeroSection from '../../Components/CareerHeroSection/CareerHeroSection';
import CareerCoursesSection from '../../Components/CareerCoursesSection/CareerCoursesSection';

function Career() {
    return (
        <div className="career-page">
            <CareerHeroSection />
            <CareerCoursesSection />
        </div>
    );
}

export default Career;