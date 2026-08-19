import React from 'react';
import { motion } from 'motion/react';
import { X, Share, PlusSquare, Download, Smartphone } from 'lucide-react';

interface PWAInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallGuide: React.FC<PWAInstallGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-md bg-white border-t sm:border-2 border-pink-100 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">📱</span>
            <h2 className="text-base font-black text-slate-800">핸드폰 홈 화면에 앱 설치하기</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1 bg-slate-50">
          {/* App Icon Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md border-2 border-pink-400 p-0.5 bg-slate-900 mb-2">
              <img
                src="/apple-touch-icon.png"
                alt="깨진 술병 아이콘"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <span className="text-sm font-black text-slate-800">취하냥 (DrunkLog)</span>
            <span className="text-xs text-pink-600 font-bold mt-0.5">
              깨진 술병 모양 전용 PWA 아이콘
            </span>
          </div>

          {/* iOS Safari Guide */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black text-pink-600">
              <Smartphone className="w-4 h-4" />
              <span>iPhone / iPad (Safari 브라우저)</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                하단 바 가운데의 <strong className="text-slate-800 font-bold">[공유 버튼 <Share className="w-3.5 h-3.5 inline mx-0.5 text-pink-500" />]</strong>을 누릅니다.
              </li>
              <li>
                메뉴를 아래로 스크롤하여 <strong className="text-pink-600 font-bold">[홈 화면에 추가 <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />]</strong>를 선택합니다.
              </li>
              <li>
                우측 상단의 <strong className="text-slate-800 font-bold">[추가]</strong>를 누르면 바탕화면에 깨진 술병 아이콘이 설치됩니다!
              </li>
            </ol>
          </div>

          {/* Android Chrome Guide */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black text-amber-600">
              <Download className="w-4 h-4" />
              <span>Android (Chrome / 삼성 인터넷)</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                브라우저 우측 상단 <strong className="text-slate-800 font-bold">[더보기 (⋮)]</strong> 메뉴를 누릅니다.
              </li>
              <li>
                <strong className="text-pink-600 font-bold">[앱 설치]</strong> 또는 <strong className="text-pink-600 font-bold">[홈 화면에 추가]</strong>를 누릅니다.
              </li>
              <li>
                완료되면 인터넷 연결 없이도 언제든 빠르게 앱처럼 실행할 수 있습니다.
              </li>
            </ol>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 active:scale-98 text-white font-black rounded-2xl text-xs transition-all shadow-md shadow-pink-200"
          >
            확인했습니다!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
