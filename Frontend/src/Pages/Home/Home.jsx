import React from 'react'
import StatsSection from '../../Components/StatsSection/StatsSection';
import HomeServiceSection from '../../Components/HomeServiceSection/HomeServiceSection';
import HomeWhoSection from '../../Components/HomeWhoSection/HomeWhoSection';
import HomeHowSection from '../../Components/HomeHowSection/HomeHowSection';
import AutoSlider from '../../Components/AutoSlider/AutoSlider';

const Home = () => {
    return (
        <>  
            <AutoSlider />
            <StatsSection />
            <HomeServiceSection />
            <HomeWhoSection />
            <HomeHowSection />
        </>
    )
}

export default Home