
import React, { useState, useEffect } from 'react';
import { History, Shield, Lock, Search, Download, FileJson, FileText, Command, Users, FileStack, ShieldAlert, Moon, Sun, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export const AccountManager = ({
    onLoginChange,
    onHistorySelect,
    onJsonExport,
    onPdfExport,
    onMarkdownExport,
    setShowDiff,
    showHiddenMenu,
    setShowHiddenMenu,
    searchHistory = [],
    onClearHistory,
    showToast,
    darkMode,
    setDarkMode
}) => {
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
    const [showLogin, setShowLogin] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [showHistory, setShowHistory] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showTools, setShowTools] = useState(false);

    const handleLogout = () => {
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
        onLoginChange(false);
        setShowLogoutConfirm(false);
        if (showToast) showToast('로그아웃되었습니다.', 'info');
    };

    useEffect(() => {
        onLoginChange(isAdmin);
    }, [isAdmin, onLoginChange]);

    return (
        <div className="flex items-center gap-2">

            {/* Advanced Tools Dropdown (Consolidated) */}
            <div className="relative">
                <button
                    onClick={() => setShowTools(!showTools)}
                    className="px-3 py-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5 border border-gray-200 dark:border-slate-700"
                    title="부가기능"
                >
                    <Command size={16} />
                    <span>부가기능</span>
                </button>

                {showTools && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTools(false)} />
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 p-1 animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={() => { setShowDiff(true); setShowTools(false); }}
                                className="w-full flex items-start gap-3 px-3 py-3 text-sm hover:bg-orange-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left group"
                            >
                                <FileStack size={18} className="text-orange-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">엑셀 버전 비교</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">이전 버전과 현재 버전의 권한 변경 사항을 한눈에 확인할 수 있습니다.</div>
                                </div>
                            </button>

                            <button
                                onClick={() => { setShowHiddenMenu(true); setShowTools(false); }}
                                className="w-full flex items-start gap-3 px-3 py-3 text-sm hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left group"
                            >
                                <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">복수 권한 충돌 가이드 (BETA)</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">중복 권한 부여 시 특정 메뉴/기능이 사라지는 이슈를 확인합니다.</div>
                                </div>
                            </button>

                            <div className="h-px bg-gray-200 dark:bg-slate-700 my-1" />

                            <button
                                onClick={() => {
                                    setDarkMode(!darkMode);
                                    setShowTools(false);
                                    showToast(darkMode ? '라이트 모드로 전환되었습니다.' : '다크 모드로 전환되었습니다.', 'success');
                                }}
                                className="w-full flex items-start gap-3 px-3 py-3 text-sm hover:bg-purple-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left group"
                            >
                                {darkMode ? <Sun size={18} className="text-yellow-500 mt-0.5 shrink-0" /> : <Moon size={18} className="text-purple-500 mt-0.5 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                        {darkMode ? '라이트 모드' : '다크 모드'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">화면 테마를 변경합니다.</div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    onJsonExport();
                                    setShowTools(false);
                                    showToast('데이터를 JSON 파일로 내보냈습니다.', 'success');
                                }}
                                className="w-full flex items-start gap-3 px-3 py-3 text-sm hover:bg-green-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left group"
                            >
                                <FileJson size={18} className="text-green-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400">데이터 백업 (JSON)</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">현재 권한 데이터를 JSON 파일로 다운로드하여 백업합니다.</div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    onMarkdownExport();
                                    setShowTools(false);
                                    showToast('마크다운 파일로 권한 명세서를 추출합니다.', 'info');
                                }}
                                className="w-full flex items-start gap-3 px-3 py-3 text-sm hover:bg-teal-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left group"
                            >
                                <FileText size={18} className="text-teal-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">명세서 추출 (MD)</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Wiki/Notion 공유용 마크다운 문서를 생성합니다.</div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setShowTools(false);
                                    showToast('인쇄 미리보기를 준비합니다.', 'info');
                                    // [v6.11.21] window.print()가 메인 스레드를 차단하므로 렌더링 후 실행되도록 지연
                                    setTimeout(() => {
                                        onPdfExport();
                                    }, 100);
                                }}
                                className="w-full flex items-start gap-3 px-3 py-3 text-sm hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left group"
                            >
                                <FileText size={18} className="text-red-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400">PDF/이미지 인쇄</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">현재 화면을 PDF나 이미지 파일로 저장하거나 인쇄합니다.</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Admin Login */}
            <div className="relative">
                <button
                    onClick={isAdmin ? () => setShowLogoutConfirm(true) : () => setShowLogin(!showLogin)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm",
                        isAdmin
                            ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700"
                    )}
                >
                    {isAdmin ? <Shield size={14} className="fill-current" /> : <Lock size={14} />}
                    <span>{isAdmin ? '관리자' : '로그인'}</span>
                </button>

                {/* Logout Confirmation Modal */}
                {showLogoutConfirm && (
                    <>
                        {/* No backdrop per request */}
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl z-[101] border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 text-center">로그아웃 하시겠습니까?</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition-all text-xs"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 text-xs"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {showLogin && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowLogin(false)} />
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-slate-700 z-20 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                            <div className="flex flex-col items-center mb-6">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl mb-3">
                                    <Shield className="text-blue-500" size={24} />
                                </div>
                                <h3 className="font-bold text-2xl text-gray-800 dark:text-white">시스템 접속</h3>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const idVal = e.target.adminId.value.trim();
                                    const pwVal = e.target.adminPw.value.trim();

                                    console.log("Login attempt with:", idVal); // Debug log

                                    if (idVal === 'admin' && pwVal === '1234') {
                                        setIsAdmin(true);
                                        localStorage.setItem('isAdmin', 'true');
                                        setShowLogin(false);
                                        setError('');
                                        onLoginChange(true);
                                        if (showToast) showToast('관리자로 로그인되었습니다.', 'success');
                                    } else {
                                        setError('ID 또는 비밀번호가 일치하지 않습니다.');
                                    }
                                }}
                                className="space-y-5"
                            >
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">아이디</label>
                                    <input
                                        name="adminId"
                                        type="text"
                                        placeholder="아이디를 입력하세요"
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-2xl text-base outline-none transition-all dark:text-white shadow-inner"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">비밀번호</label>
                                    <input
                                        name="adminPw"
                                        type="password"
                                        placeholder="비밀번호를 입력하세요"
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 rounded-2xl text-base outline-none transition-all dark:text-white shadow-inner"
                                        autoComplete="current-password"
                                    />
                                </div>
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs p-3 rounded-2xl text-center font-bold border border-red-100 dark:border-red-900/50 animate-shake">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl text-base font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Shield size={20} />
                                    <span>시스템 접속 확인</span>
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
