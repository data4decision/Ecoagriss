import React from 'react'

    import AboutHero from '@/components/about/AboutHero'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatIsEcoagris from '@/components/about/WhatIsEcoagrs'
import DataToIntelligence from '@/components/about/DataToIntelligence'
import ChallengeSection from '@/components/about/ChallengeSection'
import VisionMissionSection from '@/components/about/VisionMissionSection'
import PurposeSection from '@/components/about/PurposeSection'
import FinalCTASection from '@/components/about/FinalCTASection'

const page = () => {
  return (
    <div>
        <Navbar/>
        <AboutHero/>
        <WhatIsEcoagris/>
        <DataToIntelligence/>
         <VisionMissionSection/>
        <ChallengeSection/>
        <PurposeSection/>
        <FinalCTASection/>
        <Footer/>
        </div>
  )
}

export default page