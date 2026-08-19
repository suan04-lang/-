import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI instance
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// AI Drinking Pattern Analysis Endpoint
app.post("/api/ai/pattern-analysis", async (req, res) => {
  try {
    const { profile, reasonStats, streakStats, moneySaved } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return smart local analytical fallback if no API key is set
      return res.json({
        summary: `최근 ${reasonStats?.totalLoggedSessions || 0}회의 음주 기록을 분석했어요! 가장 빈번한 트리거는 '${reasonStats?.topReasons?.[0]?.reason || '친구와 약속'}'입니다.`,
        topTriggers: (reasonStats?.topReasons || []).slice(0, 3).map((r: any) => ({
          reason: r.reason,
          count: r.count,
          percentage: r.percentage,
          advice: `${r.reason === 'stress' ? '스트레스 상황에서는 음주 대신 심호흡 3분과 탄산수 한 잔을 먼저 시도해보세요.' : r.reason === 'friends' ? '친구들과의 자리에서는 술 한 잔 마실 때마다 물 한 잔을 꼭 챙기는 1:1 페어링을 추천해요!' : '술자리에 가기 전 오늘의 목표 잔 수를 미리 설정하고 시작해보세요.'}`
        })),
        peakDrinkingDay: reasonStats?.dayOfWeekCounts?.sort((a: any, b: any) => b.count - a.count)?.[0]?.dayName || '금',
        suggestedMissions: [
          {
            id: 'm1',
            title: '물 1:1 페이스 지키기',
            description: '술 한 잔 마실 때마다 물 한 잔을 꼭 같이 마셔요!',
            rewardCoins: 20
          },
          {
            id: 'm2',
            title: '무알콜 데이 1일 성공',
            description: '오늘 밤은 술 대신 시원한 탄산수나 차 한 잔으로 힐링하기',
            rewardCoins: 30
          },
          {
            id: 'm3',
            title: '술자리 전 목표 설정',
            description: '약속 전 미리 마실 양(예: 2잔 이하)을 정하고 지켜보기',
            rewardCoins: 25
          }
        ],
        coachCheerMessage: `집사님! 지금 ${streakStats?.currentStreak || 0}일째 건강한 간을 지키고 계시네요! 취하냥이가 항상 응원하고 있어요 🐾✨`
      });
    }

    const prompt = `
당신은 친근하고 다정한 절주/금주 전문 AI 코치 '취하냥 닥터'입니다.
사용자의 음주 기록 데이터와 음주 이유(트리거) 분석 자료를 바탕으로, 따뜻하고 구체적인 맞춤형 피드백과 절주 미션을 JSON 형식으로 제공해주세요.

[사용자 데이터]
- 이름: ${profile?.name || '집사님'}
- 주량 한계치: 소주 ${profile?.sojuLimitGlasses || 7}잔
- 현재 연속 금주일수: ${streakStats?.currentStreak || 0}일
- 이달 금주일수: ${streakStats?.totalSoberDaysInMonth || 0}일 (총 절약 술값: ${moneySaved?.totalSaved?.toLocaleString() || 0}원)
- 총 음주 기록 횟수: ${reasonStats?.totalLoggedSessions || 0}회
- 주요 음주 이유 통계: ${JSON.stringify(reasonStats?.topReasons || [])}
- 요일별 음주 분포: ${JSON.stringify(reasonStats?.dayOfWeekCounts || [])}

응답은 반드시 아래 JSON 스키마를 준수해주세요:
{
  "summary": "핵심 음주 패턴 요약 및 공감 코멘트 (2~3문장)",
  "topTriggers": [
    {
      "reason": "이유명",
      "count": 숫자,
      "percentage": 숫자,
      "advice": "이 상황(트리거)에서의 실천 가능한 구체적 절주 행동 요령"
    }
  ],
  "peakDrinkingDay": "가장 음주가 잦은 요일 (예: 금)",
  "suggestedMissions": [
    {
      "id": "mission_1",
      "title": "미션 제목 (예: 스트레스 받을 때 츄르 & 심호흡 3분)",
      "description": "구체적인 실천 가이드",
      "rewardCoins": 25
    },
    {
      "id": "mission_2",
      "title": "미션 제목",
      "description": "구체적인 실천 가이드",
      "rewardCoins": 30
    },
    {
      "id": "mission_3",
      "title": "미션 제목",
      "description": "구체적인 실천 가이드",
      "rewardCoins": 35
    }
  ],
  "coachCheerMessage": "귀여운 고양이 말투(~냥, 🐾)가 섞인 따뜻한 응원 메시지"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Pattern analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze pattern" });
  }
});

// AI Chatbot Coaching Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Local smart response
      return res.json({
        reply: `집사님! 절주를 향한 멋진 도전을 응원해요 🐾✨ 물 한 잔 자주 마시고, 술자리가 있을 땐 미리 목표 잔 수를 설정해보는 걸 추천드려요냥! 어떤 점이 가장 고민되시나요?`,
        suggestedTip: "술자리 전 식사를 든든히 하면 알코올 흡수가 늦춰져요!"
      });
    }

    const systemInstruction = `
당신은 귀엽고 지혜로운 건강&절주 코치 '취하냥이'입니다.
말투는 다정하고 친근하며, 문장 끝에 가끔 귀엽게 '~냥', '🐾', '✨'을 붙입니다.
사용자의 금주/절주 고민, 술자리 거절 팁, 스트레스 대처법, 숙취 관리법 등에 대해 친절하고 과학적이면서도 따뜻하게 조언해주세요.

사용자 정보:
- 이름: ${userContext?.name || '집사님'}
- 주량 한계: 소주 ${userContext?.sojuLimitGlasses || 7}잔
- 연속 금주 일수: ${userContext?.currentStreak || 0}일
- 지금까지 절약한 술값: ${userContext?.totalSaved?.toLocaleString() || 0}원
- 가장 잦은 음주 이유: ${userContext?.topReason || '친구와 약속'}
`;

    const conversationHistory = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: conversationHistory,
      config: {
        systemInstruction
      }
    });

    res.json({
      reply: response.text || "냥? 다시 한 번 말씀해주시겠어요? 🐾"
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to generate chat response" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`취하냥 Server running on port ${PORT}`);
  });
}

startServer();
