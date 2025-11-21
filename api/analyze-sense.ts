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
        3.  **종합 인사이트 및 트렌드 (Trend Insights):**
            - 이 감각에 대해 ${disagreePercentage.toFixed(0)}%가 공감하지 못했다는 점(혹은 공감했다는 점)에서 발견할 수 있는 **사회적/문화적 인사이트**는 무엇인가요?
            - 개인의 감각 분석을 넘어, 이 상황과 관련된 **최신 트렌드**나 **마케팅 포인트**를 분석해주세요. (예: "최근 '시간 가성비'를 중시하는 트렌드와 맞물려...")
            - **핵심 키워드**: 이 현상을 설명할 수 있는 핵심 키워드 1~2개를 제시하고 설명해주세요.
        `;
    } else {
      gapAnalysisPromptSection = `
        3.  **종합 인사이트 및 트렌드 (Trend Insights):**
            - 대다수가 공감하는 이 감각에서 읽을 수 있는 **시대적 트렌드**는 무엇인가요?
            - 이 공감대를 활용하여 어떤 **새로운 가치**나 **서비스**를 제안할 수 있을지 마케팅적 관점에서 분석해주세요.
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
        당신은 최신 트렌드와 소비자 심리를 꿰뚫어 보는 '트렌드 & 마케팅 분석가'이자 '감각 훈련 코치'입니다.
        사용자의 경험 데이터와 **다른 사용자들의 반응(댓글, 태그)**을 종합적으로 분석하여, 이 감각이 시장에서 어떤 위치에 있는지 분석하고, 사용자가 대중적인 감각을 익히거나 자신만의 감각을 날카롭게 다듬을 수 있도록 코칭해주세요.

        ### 분석할 경험 데이터:
        - 경험 종류: ${post.type === 'best' ? '긍정적 경험' : '부정적 경험'}
        - 객관적 상황: "${post.situation}"
        - 주관적 감각: "${post.sensation}"
        - 감정 태그: ${post.emotion_tag}
        - 커뮤니티 반응: ${post.agree_count}명 공감, ${post.disagree_count}명 비공감
        - **주요 반응 태그**: ${reactionTagsText}
        - **사용자 댓글**:
${commentsText}

        ### 분석 지침:

        1.  **공감하는 시선 (agree):**
            - **타겟 페르소나 분석**: 이 감각에 깊이 공감하는 사람들은 어떤 성향, 라이프스타일, 가치관을 가진 사람들일까요? 구체적인 '페르소나'를 정의해주세요. (예: "효율보다 감성을 중시하는 20대 미니멀리스트")
            - **인사이트 & 취향**: 그들은 평소 어떤 것을 좋아하고, 어떤 소비 패턴을 보일까요? 이 감각을 좋아하는 사람들이 관심을 가질만한 다른 트렌드나 키워드를 제시해주세요. **(반응 태그와 댓글에서 드러난 키워드를 적극 활용하세요)**

        2.  **다른 시선 (disagree):**
            - **비공감 페르소나 분석**: 이 감각에 공감하지 못하는 사람들은 어떤 가치관을 최우선으로 여길까요? 그들의 입장에서 이 감각이 왜 이해되지 않을지 설명해주세요. (예: "가성비와 실용성을 최우선으로 하는 40대 가장")
            - **반대 입장의 니즈**: 그들은 대신 어떤 경험을 선호할까요? 그들을 만족시키기 위해서는 어떤 요소가 더 필요했을지 분석해주세요. **(댓글에 나타난 반대 의견이 있다면 참고하세요)**  ${gapAnalysisPromptSection}
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