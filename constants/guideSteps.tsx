
import ThermometerIcon from '../components/icons/ThermometerIcon';
import TargetIcon from '../components/icons/TargetIcon';
import CommunityIcon from '../components/icons/CommunityIcon';

import { Sparkles } from 'lucide-react';

export const GUIDE_STEPS = [
    {
        icon: <ThermometerIcon className="w-12 h-12 text-[#FF6B00]" />,
        title: "혹시... '감' 좋은 편?",
        text: "내가 느낀 감정, 아이디어. 사람들도 공감할까요? 나와 세상의 온도 차이를 재보며 감각을 키워요.",
    },
    {
        icon: <CommunityIcon className="w-12 h-12 text-[#FF6B00]" />,
        title: "오늘의 최고와 최악을 기록해요.",
        text: "다른 사람들은 어떤 감정을 느꼈을까요? 서로의 감정을 비교하며 트렌드를 읽는 감각을 단련해 보세요.",
    },
    {
        icon: <TargetIcon className="w-12 h-12 text-[#FF6B00]" />,
        title: "시장 기회를 찾아봐요",
        text: "경험과 공감 온도계 속 숨겨진 트렌드를 AI와 함께 발견해봐요.",
    },
    {
        icon: <Sparkles className="w-12 h-12 text-[#FF6B00]" />,
        title: "당신이라면 좋아할 거에요 😊",
        text: "트렌드를 읽어야 하는 마케터, 사람의 마음을 얻어야 하는 기획자, 영감이 필요한 크리에이터에게 강력 추천합니다!",
    },
];
