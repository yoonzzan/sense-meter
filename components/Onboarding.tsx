
import React, { useState } from 'react';
import SenseMeterIcon from './icons/SenseMeterIcon';
import ThermometerIcon from './icons/ThermometerIcon';
import TargetIcon from './icons/TargetIcon';
import CommunityIcon from './icons/CommunityIcon';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: <ThermometerIcon className="w-24 h-24 text-[#FF6B00]" />,
    title: "혹시... '감' 좋은 편?",
    text: "나의 감각과 세상의 감각 사이, 그 아슬아슬한 온도 차이를 재볼까요?",
  },
  {
    icon: <TargetIcon className="w-24 h-24 text-[#FF6B00]" />,
    title: "오늘의 최고와 최악을 기록해요.",
    text: "일상 속 경험을 나누고 당신의 감각 데이터를 쌓아보세요. 정답은 없어요, 당신의 느낌이 중요할 뿐!",
  },
  {
    icon: <CommunityIcon className="w-24 h-24 text-[#FF6B00]" />,
    title: "세상의 감각과 온도를 맞춰봐요.",
    text: "다른 사람들은 어떻게 느꼈을까요? 서로의 감각을 비교하며 트렌드를 읽는 눈을 단련해 보세요.",
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = onboardingSteps[step];

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white p-8">
      <div className="w-full max-w-sm flex justify-center pt-8">
         <SenseMeterIcon className="h-8" />
      </div>
      
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="mb-8">{currentStep.icon}</div>
        <h1 className="text-2xl font-bold mb-4 text-gray-900">{currentStep.title}</h1>
        <p className="text-gray-600">{currentStep.text}</p>
      </div>

      <div className="w-full max-w-sm pb-8">
        <div className="flex justify-center mb-4">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === step ? 'bg-[#FF6B00]' : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
        <button
          onClick={handleNext}
          className="w-full bg-[#FF6B00] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#E66000] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B00]"
        >
          {step === onboardingSteps.length - 1 ? '센스 측정 시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
