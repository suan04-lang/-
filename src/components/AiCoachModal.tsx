import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles, CheckCircle2, Award, Lightbulb, RefreshCw } from 'lucide-react';
import { UserProfile, AiPatternAnalysisResult } from '../types';
import { getReasonStatistics, calculateSoberStreak, calculateSavedMoney } from '../utils/storage';
import { playCheerChime, triggerVibration } from '../utils/audio';

interface AiCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export const AiCoachModal: React.FC<AiCoachModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AiPatternAnalysisResult | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      text: `안냥! 나는 집사님의 건강과 절주를 함께하는 '닥터 취하냥'이다냥 🐾\n평소 음주 고민이나 술자리 대처법, 스트레스 해소법에 대해 편하게 물어봐달라냥! ✨`,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Mission Completed Tracker
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  // Fetch Pattern Analysis
  const fetchPatternAnalysis = async () => {
    setIsLoadingAnalysis(true);
    try {
      const reasonStats = getReasonStatistics(30);
      const streakStats = calculateSoberStreak();
      const moneySaved = calculateSavedMoney(profile.averageDrinkingCostWon);

      const res = await fetch('/api/ai/pattern-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          reasonStats,
          streakStats,
          moneySaved
        })
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      // Fallback
      const reasonStats = getReasonStatistics(30);
      const topReason = reasonStats.topReasons[0]?.reason || 'friends';
      setAnalysisResult({
        summary: `최근 30일간의 음주 기록을 분석했어요! 가장 주요한 트리거는 '${topReason === 'stress' ? '스트레스' : topReason === 'friends' ? '친구와 약속' : '일상'}' 상황입니다.`,
        topTriggers: [
          {
            reason: topReason,
            count: reasonStats.topReasons[0]?.count || 1,
            percentage: reasonStats.topReasons[0]?.percentage || 100,
            advice: '술자리 전 미리 든든하게 식사하고, 술 한 잔마다 물 한 잔을 꼭 챙기는 페어링을 실천해보세요.'
          }
        ],
        peakDrinkingDay: '금',
        suggestedMissions: [
          {
            id: 'm_water',
            title: '술자리 물 1:1 페어링 지키기',
            description: '술 한 모금마다 물 한 모금을 마셔 체내 알코올 농도를 낮춰요.',
            rewardCoins: 25
          },
          {
            id: 'm_soda',
            title: '스트레스 받을 때 탄산수 마시기',
            description: '술 생각 날 때 시원한 탄산수+레몬으로 갈증을 해소해요.',
            rewardCoins: 30
          },
          {
            id: 'm_goal',
            title: '오늘의 목표 음주량 설정하기',
            description: '약속 전 마실 양(예: 2잔 이하)을 정하고 초과하지 않기',
            rewardCoins: 35
          }
        ],
        coachCheerMessage: `집사님! 절주를 향한 작은 걸음 하나하나가 멋진 변화를 만듭니다냥 🐾✨`
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysisResult) {
      fetchPatternAnalysis();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: inputText.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSendingChat(true);

    try {
      const streakStats = calculateSoberStreak();
      const moneySaved = calculateSavedMoney(profile.averageDrinkingCostWon);
      const reasonStats = getReasonStatistics(30);

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userContext: {
            name: profile.name,
            sojuLimitGlasses: profile.sojuLimitGlasses,
            currentStreak: streakStats.currentStreak,
            totalSaved: moneySaved.totalSaved,
            topReason: reasonStats.topReasons[0]?.reason || '친구와 약속'
          }
        })
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          text: data.reply || '냥? 멋진 말씀이다냥! 🐾',
          timestamp: Date.now()
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          text: '집사님! 절주를 향한 도전을 항상 응원하고 있어요냥 🐾 물 자주 마시고 힘내라냥!',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Complete Mission and award coins
  const handleCompleteMission = (missionId: string, rewardCoins: number) => {
    if (completedMissions.includes(missionId)) return;

    triggerVibration(60);
    playCheerChime();
    setCompletedMissions(prev => [...prev, missionId]);

    onUpdateProfile(prev => ({
      ...prev,
      coins: prev.coins + rewardCoins
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-md bg-white border-t sm:border-2 border-pink-100 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white text-sm shadow-xs">
              🐾
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                닥터 취하냥 <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">AI 코치</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                내 패턴 분석 기반 맞춤 절주 처방 & 1:1 상담
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'analysis'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 맞춤 패턴 진단 & 미션
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💬 냥코치와 1:1 상담
            </button>
          </div>
        </div>

        {/* Tab 1: AI Pattern Analysis & Customized Missions */}
        {activeTab === 'analysis' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {isLoadingAnalysis ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-500 animate-spin flex items-center justify-center mx-auto text-xl">
                  🐾
                </div>
                <p className="text-xs font-bold text-slate-600">
                  집사님의 음주 패턴 데이터를 분석 중이다냥... 🔍✨
                </p>
              </div>
            ) : analysisResult ? (
              <>
                {/* Summary Card */}
                <div className="bg-white border border-pink-100 rounded-3xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-pink-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      닥터 냥코치의 패턴 진단
                    </span>
                    <button
                      onClick={fetchPatternAnalysis}
                      className="text-[11px] text-slate-400 hover:text-pink-600 font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> 다시 분석
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {analysisResult.summary}
                  </p>
                </div>

                {/* Top Trigger Actionable Advice */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    주요 음주 트리거 맞춤 대처법
                  </h3>
                  {analysisResult.topTriggers.map((t, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-black text-slate-800">
                        <span>🎯 상황: {t.reason}</span>
                        <span className="text-pink-600 text-[11px]">{t.percentage}% 발생</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-normal">
                        👉 {t.advice}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Customized Daily Moderation Missions with Coin Rewards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-pink-500" />
                      오늘의 추천 절주 미션
                    </h3>
                    <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full">
                      완료 시 코인 보상 🪙
                    </span>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.suggestedMissions.map((m) => {
                      const isDone = completedMissions.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          className={`bg-white border rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-2 transition-all ${
                            isDone ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200/80'
                          }`}
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <span>{m.title}</span>
                              <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200">
                                +{m.rewardCoins} 코인
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {m.description}
                            </p>
                          </div>

                          <button
                            onClick={() => handleCompleteMission(m.id, m.rewardCoins)}
                            disabled={isDone}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                              isDone
                                ? 'bg-emerald-500 text-white shadow-xs cursor-default'
                                : 'bg-pink-500 hover:bg-pink-600 text-white shadow-xs active:scale-95'
                            }`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> 완료!
                              </>
                            ) : (
                              '실천 완료'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cheer Message */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2">
                  <span className="text-xl">😽</span>
                  <span>{analysisResult.coachCheerMessage}</span>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Tab 2: AI Chatbot Consultation */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[85%]">
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                        🐾
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-pink-500 text-white rounded-br-none shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              {isSendingChat && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl text-xs text-slate-500 border border-slate-200">
                    <span className="animate-pulse">냥코치가 답변을 생각하고 있다냥... 🐾</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="px-4 py-1.5 overflow-x-auto flex gap-1.5 no-scrollbar bg-slate-100/70 border-t border-slate-200/60">
              {[
                '회식에서 술 거절하는 법 알려줘',
                '스트레스 받을 때 술 대체할 만한 건?',
                '숙취에 좋은 음식 추천해줘',
                '금주 3일차인데 응원해줘!'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputText(suggestion)}
                  className="px-2.5 py-1 bg-white hover:bg-pink-50 border border-slate-200 text-slate-600 hover:text-pink-600 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="궁금한 절주 고민을 물어보세요냥..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSendingChat}
                className="w-10 h-10 rounded-2xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};
