import React from 'react';
import GuideCard from './GuideCard';
import { GUIDE_STEPS } from '../constants/guideSteps';

const GuideBanner: React.FC = () => {
    return (
        <div className="w-full bg-white border-b border-gray-100 py-4">
            <div className="max-w-xl mx-auto px-4">
                <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
                    {GUIDE_STEPS.map((step, index) => (
                        <div key={index} className="snap-center">
                            <GuideCard
                                icon={step.icon}
                                title={step.title}
                                text={step.text}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GuideBanner;
