import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';

// Vercel Edge Runtime 제거 (Node.js 런타임 사용)
// export const config = {
//   runtime: 'edge',
// };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    const { post } = req.body;

    if (!post || !post.situation || !post.sensation) {
      return res.status(400).json({ error: 'Post data is incomplete. "situation" and "sensation" are required.' });
    }

    const totalVotes = post.agree_count + post.disagree_count;
    const hasSignificantGap = post.disagree_count > 0;

    let gapAnalysisPromptSection = '';

    // 기본 스키마 정의
    const schema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        agree: {
          type: SchemaType.STRING,
          description: '이 감각이 어필할 수 있는 타겟 오디언스 분석 및 현재 트렌드와의 연관성 (마케팅 관점)'
        },
        disagree: {
          type: SchemaType.STRING,
          description: '대중적인 관점에서 공감받지 못하는 이유 및 시장성 한계 분석 (트렌드 분석 관점)'
        },
        gapAnalysis: {
          type: SchemaType.STRING,
          description: '전체적인 공감/비공감 반응을 통해 읽을 수 있는 사회적 인사이트 및 최신 트렌드 분석',
          nullable: true
        }
      },
      required: ['agree', 'disagree']
    };

    if (hasSignificantGap) {
      const disagreePercentage = totalVotes > 0 ? (post.disagree_count / totalVotes) * 100 : 0;
      gapAnalysisPromptSection = `
        3.  **종합 인사이트 및 트렌드 (Market Opportunity):**
            - **시장 기회 발견**: ${disagreePercentage.toFixed(0)}%의 비공감(혹은 공감) 데이터에서 발견할 수 있는 새로운 니치 마켓이나 차별화 포인트는 무엇인가요?
            - **트렌드 키워드**: 이 현상을 관통하는 마케팅/트렌드 핵심 키워드 1~2개를 선정하고, 이를 활용한 서비스 컨셉을 한 줄로 제안해주세요.
        `;
    } else {
      gapAnalysisPromptSection = `
        3.  **종합 인사이트 및 트렌드 (Market Opportunity):**
            - **메가 트렌드 연결**: 대중적인 공감을 얻은 이 감각이 현재의 어떤 메가 트렌드와 맞닿아 있는지 분석해주세요.
            - **서비스 확장 전략**: 이 확실한 수요를 바탕으로 서비스를 확장한다면 어떤 방향이 유효할지 구체적인 전략을 제안해주세요.
       `;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const commentsText = post.comments && post.comments.length > 0
      ? post.comments.map((c: any) => `- ${c.text}`).join('\n')
      : '없음';

    const reactionTagsText = post.reaction_tags && post.reaction_tags.length > 0
      ? post.reaction_tags.map((t: any) => `${t.tag} (${t.count})`).join(', ')
      : '없음';

    const prompt = `
        당신은 대중의 감각 데이터를 분석하여 **성공적인 서비스와 제품을 기획하는 'Product Insight Analyst'**입니다.
        사용자의 경험과 커뮤니티 반응(댓글, 태그)을 분석하여, **이 감각이 시장에서 어떤 기회를 가질 수 있는지**, **어떤 타겟을 공략해야 하는지** 일관성 있고 구체적인 인사이트를 제공해주세요.

        ### 분석할 경험 데이터:
        - 경험 종류: ${post.type === 'best' ? '긍정적 경험' : '부정적 경험'}
        - 객관적 상황: "${post.situation}"
        - 주관적 감각: "${post.sensation}"
        - 감정 태그: ${post.emotion_tag}
        - 커뮤니티 반응: ${post.agree_count}명 공감, ${post.disagree_count}명 비공감
        - **주요 반응 태그**: ${reactionTagsText}
        - **사용자 댓글**:
${commentsText}

        ### 분석 지침 (반드시 아래 형식을 지켜주세요):

        1.  **공감하는 시선 (Target Audience Analysis):**
            - **핵심 타겟 정의**: 이 감각에 반응하는 핵심 타겟 그룹을 정의하고 그들의 특징(라이프스타일, 가치관)을 한 문장으로 요약해주세요.
            - **서비스 적용 포인트**: 이들이 좋아하는 요소(반응 태그/댓글 참고)를 실제 서비스나 제품에 어떻게 녹여낼 수 있을지 구체적인 아이디어를 제안해주세요.

        2.  **다른 시선 (Unmet Needs Analysis):**
            - **이탈 요인 분석**: 공감하지 못하는 그룹이 느끼는 '불편함'이나 '괴리감'의 원인은 무엇인가요? (댓글의 반대 의견 참고)
            - **보완 및 개선 방향**: 이들을 포용하거나 설득하기 위해 서비스가 갖춰야 할 보완점이나 대안적인 기능을 제안해주세요. ${gapAnalysisPromptSection}
      `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    const analysisJson = JSON.parse(textResponse);

    return res.status(200).json(analysisJson);

  } catch (error: any) {
    console.error('Error in API route:', error);

    // 에러 객체의 모든 속성을 문자열로 변환하여 상세 정보로 반환
    const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return res.status(500).json({
      error: 'Failed to get AI analysis.',
      details: `${errorMessage} (Debug: ${errorDetails})`,
      debug: {
        hasKey: !!apiKey,
        model: 'gemini-1.5-flash',
        sdk: '@google/generative-ai'
      }
    });
  }
}