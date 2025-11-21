import React from 'react';

interface GuideCardProps {
    icon: React.ReactNode;
    title: string;
    text: string;
}

const GuideCard: React.FC<GuideCardProps> = ({ icon, title, text }) => {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-row items-center text-left shadow-sm min-w-[300px] h-full">
            <div className="mr-3 flex-shrink-0 transform scale-75 origin-center">
                {icon}
            </div>
            <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed break-keep">
                    {text}
                </p>
            </div>
        </div>
    );
};

export default GuideCard;
