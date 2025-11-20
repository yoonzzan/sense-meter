import { GoogleGenAI, Type } from '@google/genai';
import type { Post } from '../types';

// Vercel Edge Runtime 사용 설정
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is not configured on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const post: Post = body.post;

    if (!post || !post.situation || !post.sensation) {
      return new Response(JSON.stringify({ error: 'Post data is incomplete. "situation" and "sensation" are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const totalVotes = post.agree_count + post.disagree_count;
    const hasSignificantGap = post.disagree_count > 0;

    let gapAnalysisPromptSection = '';

    // 기본 스키마 정의
    let schemaProperties: any = {
      agree: {
        type: Type.STRING,
        description: '사용자의 감정에 공감하며, 그 이유와 사용자의 성향을 추측하는 분석 내용입니다.'
      },
      disagree: {
        type: Type.STRING,
        description: '객관적 상황을 바탕으로, 공감하지 않는 사람의 입장과 그 이유, 성향을 추측하는 분석 내용입니다.'
      }
    };
    let schemaRequired = ['agree', 'disagree'];

    if (hasSignificantGap) {
      const disagreePercentage = totalVotes > 0 ? (post.disagree_count / totalVotes) * 100 : 0;
      gapAnalysisPromptSection = `
        3.  **감각 간극 심층 분석 (gapAnalysis):**
            - 이 경험은 ${disagreePercentage.toFixed(0)}%의 사람들에게는 공감받지 못했습니다. 이처럼 '감각의 간극'이 발생한 이유를 심층적으로 분석해주세요.
            - 사용자의 감각이 왜 소수의 의견이 되었을지, 그 원인을 가치관의 차이, 세대 차이, 개인적 경험의 특수성 등 다양한 각도에서 설명해주세요.
            - 이 분석은 사용자가 자신의 독특한 감각을 이해하고 자책하지 않도록 돕는, 긍정적이고 건설적인 관점으로 제시되어야 합니다.
        `;

      // 간극 분석이 필요한 경우 스키마에 추가
      schemaProperties.gapAnalysis = {
        type: Type.STRING,
        description: '다수의 사람들과 감각의 차이가 발생한 이유에 대한 심층 분석 내용입니다.'
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        당신은 한국 20대의 일상 경험을 분석하는 위트 있고 통찰력 있는 심리 분석가입니다. 주어진 '객관적 상황'과 '커뮤니티 반응' 데이터를 종합하여, 사용자의 '주관적 감각'에 공감하는 입장과 공감하지 않는 입장을 모두 제시해주세요.

        ### 분석할 경험 데이터:
        - 경험 종류: ${post.type === 'best' ? '최고의 경험' : '최악의 경험'}
        - 객관적 상황: "${post.situation}"
        - 주관적 감각: "${post.sensation}"
        - 감정 태그: ${post.emotion_tag}
        - 커뮤니티 반응: ${post.agree_count}명 공감, ${post.disagree_count}명 비공감

        ### 분석 지침:

        1.  **공감하는 시선 (agree):**
            - '상황'과 '감각'을 연결하여, 왜 이 경험이 사용자에게 '최고' 또는 '최악'이었는지 깊이 공감하며 설명해주세요.
            - 이 반응을 통해 추측할 수 있는 사용자의 성격, 가치관, 중요하게 생각하는 점 등을 짚어주세요. (예: "작은 디테일에서 큰 행복을 느끼시는 분인 것 같아요.")

        2.  **다른 시선 (disagree):**
            - 오직 '객관적 상황'만을 두고 봤을 때, 왜 어떤 사람들은 이 경험에 공감하지 못할 수 있는지 설명해주세요.
            - 그들이 공감하지 못하는 이유는 무엇일까요? 공감하지 않는 사람들은 어떤 성향이나 가치관을 가졌을지 추측해주세요. (예: "반면, 좀 더 실용적인 성향의 사람이라면...")

        ${gapAnalysisPromptSection}
      `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Updated to latest stable model if available, or keep 1.5-flash
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: schemaRequired,
        }
      }
    });

    const textResponse = response.text ? response.text.trim() : "{}";
    const analysisJson = JSON.parse(textResponse);

    return new Response(JSON.stringify(analysisJson), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to get AI analysis.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}