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
          description: '전체적인 공감/비공감 반응을 통해 예측하는 트렌드의 파급력 및 시장 기회 (파도의 크기 예측)',
          nullable: true
        }
      },
      required: ['agree', 'disagree']
    };

    if (hasSignificantGap) {
      const disagreePercentage = totalVotes > 0 ? (post.disagree_count / totalVotes) * 100 : 0;
      gapAnalysisPromptSection = `
        **3. gapAnalysis (Impact Prediction - 파도의 크기):**
        *   **시장 기회 발견 (Niche Market)**:\n\n(두 번 줄바꿈 후 내용 작성) ${disagreePercentage.toFixed(0)}%의 비공감(혹은 공감) 데이터는 어떤 새로운 니치 마켓의 가능성을 시사하나요? 이 물결이 닿을 수 있는 숨겨진 시장을 찾아주세요.
        *   **아이디어 제안 (Provider vs User)**:\n\n(두 번 줄바꿈 후 내용 작성)
            *   **공급자(기업) 입장**: 이 감각을 활용해 어떤 차별화된 경험이나 마케팅을 제공할 수 있을까요?
            *   **사용자 입장**: 사용자는 이 경험을 통해 어떤 새로운 가치나 편의를 얻고 싶어 할까요?
        *   **트렌드 키워드 (Trend Keywords)**:\n\n(두 번 줄바꿈 후 내용 작성) 이 현상을 관통하는 마케팅/트렌드 핵심 키워드 1~2개를 선정하고, 이를 활용한 서비스 컨셉을 한 줄로 제안해주세요.
        *   *주의: '3. 종합 인사이트' 같은 대분류 제목은 포함하지 마세요.*
        `;
    } else {
      gapAnalysisPromptSection = `
        **3. gapAnalysis (Impact Prediction - 파도의 크기):**
        *   **메가 트렌드 연결 (Mega Trend Connection)**:\n\n(두 번 줄바꿈 후 내용 작성) 대중적인 공감을 얻은 이 감각 물결은 현재의 어떤 거대한 메가 트렌드와 맞닿아 있나요? 이 파도가 어디까지 커질 수 있을지 예측해주세요.
        *   **아이디어 제안 (Provider vs User)**:\n\n(두 번 줄바꿈 후 내용 작성)
            *   **공급자(기업) 입장**: 이 확실한 수요(큰 파도)를 타기 위해 기업은 어떤 서비스 전략을 취해야 할까요?
            *   **사용자 입장**: 대중은 이 경험에서 더 나아가 어떤 발전된 서비스를 기대하고 있을까요?
        *   **서비스 확장 전략 (Expansion Strategy)**:\n\n(두 번 줄바꿈 후 내용 작성) 이 수요를 바탕으로 서비스를 확장한다면 어떤 방향이 유효할지 구체적인 전략을 제안해주세요.
        *   *주의: '3. 종합 인사이트' 같은 대분류 제목은 포함하지 마세요.*
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
        당신은 대중의 감각 데이터를 분석하여 **미래의 트렌드를 예측하고 시장 기회를 발굴하는 'Trend Forecaster & Market Opportunity Analyst'**입니다.
        사용자의 경험과 커뮤니티 반응(댓글, 태그)을 분석하여, **이 감각이 얼마나 큰 파도(트렌드)가 될 수 있는지**, **어떤 시장 기회를 만들어낼 수 있는지** 통찰력 있는 인사이트를 제공해주세요.

        ### 분석할 경험 데이터:
        - 경험 종류: ${post.type === 'best' ? '긍정적 경험 (Best)' : '부정적 경험 (Worst)'}
        - 객관적 상황: "${post.situation}"
        - 주관적 감각: "${post.sensation}" (사용자가 느낀 핵심 감정입니다. 이 감정에 집중하세요.)
        - 감정 태그: ${post.emotion_tag}
        - 커뮤니티 반응: ${post.agree_count}명 공감, ${post.disagree_count}명 비공감
        - **주요 반응 태그**: ${reactionTagsText}
        - **사용자 댓글**:
${commentsText}

        ### 분석 지침 (각 JSON 필드에 맞춰 작성해주세요):
        **중요: 각 필드의 내용은 JSON 형식이 아닌, '줄글(Markdown)'로 작성해주세요. 중괄호 {}를 사용하지 마세요.**
        **모든 소제목은 반드시 \`**소제목**:\` 형식으로 볼드 처리하고, 소제목 뒤에는 반드시 '두 번 줄바꿈(\\n\\n)'을 하여 내용과 명확히 분리해주세요.**
        
        **핵심 주의사항 (Tone vs Fact):**
        *   **상황과 말투를 분리하세요.** 사용자가 'Worst' 경험을 유머러스하게 표현하더라도, 그것은 대처 방식일 뿐입니다. **상황의 본질적인 불편함(Pain Point)**에 집중하여 분석하세요.
        *   **타겟 정의 기준:** 이 글을 보고 웃는 독자가 아니라, **이런 상황을 직접 겪었을 때 깊이 공감할 당사자**를 타겟으로 정의하세요.

        **1. agreeAnalysis (Wave Analysis - 공감의 물결):**
        *   **핵심 타겟 정의 (Early Adopters)**:\n\n(두 번 줄바꿈 후 내용 작성) 이 **상황(Situation)**에 가장 먼저 반응하고 공감할 '얼리어답터' 그룹은 누구인가요? 이 물결은 어디서부터 시작되나요?
        *   **서비스 적용 포인트 (Actionable Insight)**:\n\n(두 번 줄바꿈 후 내용 작성) 이들이 겪는 상황의 본질(니즈/페인포인트)을 해결하거나 충족시켜줄 수 있는 구체적인 서비스/제품 아이디어를 제안해주세요.
        *   *주의: '1. 공감하는 시선' 같은 대분류 제목은 포함하지 마세요.*

        **2. disagreeAnalysis (Another Perspective - 다른 시선):**
        *   **비공감 원인 분석**:\n\n(두 번 줄바꿈 후 내용 작성) 공감하지 못하는 그룹은 이 상황을 어떻게 다르게 받아들일까요? (상황에 대한 이해도 차이, 가치관의 차이 등)
        *   **보완 및 개선 방향**:\n\n(두 번 줄바꿈 후 내용 작성) 이들을 포용하거나 설득하기 위해 서비스가 갖춰야 할 보완점이나 대안적인 기능을 제안해주세요.
        *   *주의: '2. 다른 시선' 같은 대분류 제목은 포함하지 마세요.*

        ${gapAnalysisPromptSection}
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