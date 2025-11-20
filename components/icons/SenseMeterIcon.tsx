
import React from 'react';

const SenseMeterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <div className="flex items-center space-x-2">
       <svg 
        className="w-8 h-8 text-[#FF6B00]"
        viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       >
        <path d="M12 5C12 5 14 2 17 2C20 2 22 4 22 7C22 10 12 22 12 22C12 22 2 10 2 7C2 4 4 2 7 2C10 2 12 5 12 5Z" fill="#FF6B00" fillOpacity="0.1"/>
        <path d="M12 8V16"/>
        <path d="M8 12H16"/>
       </svg>
      <span className="font-bold text-xl tracking-tighter text-gray-800" style={{fontFamily: "'Noto Sans KR', sans-serif"}}>센스미터</span>
    </div>
  );
};

export default SenseMeterIcon;
