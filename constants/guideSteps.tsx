
import ThermometerIcon from '../components/icons/ThermometerIcon';
import TargetIcon from '../components/icons/TargetIcon';
import CommunityIcon from '../components/icons/CommunityIcon';

import { Sparkles } from 'lucide-react';

export const GUIDE_STEPS = [
    {
        icon: <ThermometerIcon className="w-12 h-12 text-[#FF6B00]" />,
        title: "혹시... '감' 좋은 편?",
        text: "나의 감각과 세상의 감각 사이, 그 아슬아슬한 온도 차이를 재볼까요?",
    },
    {
        icon: <CommunityIcon className="w-12 h-12 text-[#FF6B00]" />,
        title: "오늘의 최고와 최악을 기록해요.",
        text: "다른 사람들은 어떻게 느꼈을까요? 서로의 감각을 비교하며 트렌드를 읽는 눈을 단련해 보세요.",
    },
    {
        icon: <TargetIcon className="w-12 h-12 text-[#FF6B00]" />,
        title: "세상의 감각과 온도를 맞춰봐요.",
        text: "경험을 기록하면 AI가 나와 대중의 시각 차이를 분석하고, 그 속에 숨겨진 트렌드와 시장 기회를 읽어드립니다.",
    },
    {
        icon: <Sparkles className="w-12 h-12 text-[#FF6B00]" />,
        title: "당신이라면 좋아할 거에요 :)",
        text: "트렌드를 읽어야 하는 마케터, 사람의 마음을 얻어야 하는 기획자, 영감이 필요한 크리에이터에게 강력 추천합니다!",
    },
];
