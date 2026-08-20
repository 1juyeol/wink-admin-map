
import { useState, useEffect } from 'react';
import { parseExcel } from '../utils/excelParser';
// Embedded Base64 Excel Data (Guaranteed Loading)
import { EXCEL_BASE64 } from '../data/embeddedExcel';

export function usePermissionData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Check cache first
                const CACHE_KEY = 'wink_permission_data_final_v12_prod';
                const CACHE_VERSION = 'v12.0';

                localStorage.removeItem(CACHE_KEY); // Force clear before use
                const IS_DEV = true; // Temporary hardcoded to true to force refresh

                const cachedData = IS_DEV ? null : localStorage.getItem(CACHE_KEY); // [한국어 설명] 로컬 스토리지에서 캐시 데이터 로드

                if (cachedData) {
                    try {
                        const parsed = JSON.parse(cachedData);

                        // [한국어 설명] 캐시 버전 확인 및 로그 출력 (디버깅)
                        if (parsed.version === CACHE_VERSION && parsed.data) {
                            console.log(`✅ Using cached data (Version: ${parsed.version})`);
                            setData(parsed.data);
                            setLoading(false);
                            return;
                        } else {
                            console.warn(`⚠️ Cache found but version mismatch. Expected: ${CACHE_VERSION}, Found: ${parsed.version || 'unknown'}`);
                            localStorage.removeItem(CACHE_KEY); // [한국어 설명] 버전 불일치 시 즉시 삭제
                        }
                    } catch (e) {
                        console.warn("Cache parse failed, cleaning up...", e);
                        localStorage.removeItem(CACHE_KEY);
                    }
                } else {
                    if (!IS_DEV) console.log(`ℹ️ No cache found for key: ${CACHE_KEY}`);
                }

                console.log("Loading embedded Excel data (Zero Network)...");

                // Base64 to ArrayBuffer conversion (Browser compatible)
                const binaryString = atob(EXCEL_BASE64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Parse directly from memory buffer
                const result = await parseExcel(bytes);

                if (result && result.menuStructure) {
                    // Path Logic
                    const addPath = (nodes, parentPath = '') => {
                        nodes.forEach(node => {
                            const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
                            node.fullPath = currentPath;
                            if (node.children) addPath(node.children, currentPath);
                        });
                    };
                    addPath(result.menuStructure);
                    setData(result);

                    // Cache the result
                    try {
                        const cachePayload = {
                            version: CACHE_VERSION,
                            timestamp: new Date().toISOString(),
                            data: result
                        };
                        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
                        console.log(`💾 Cache Saved: ${CACHE_KEY} (v${CACHE_VERSION})`); // [한국어 설명] 캐시 저장 성공 로그
                    } catch (e) {
                        console.error("❌ Cache Save Failed (Quota Exceeded?):", e); // [한국어 설명] 캐시 저장 실패 로그 (용량 초과 등)
                        // [한국어 설명] 저장 실패 시, 혹시 모를 오래된 캐시 정리 시도
                        localStorage.clear();
                    }

                    console.log("엑셀 데이터 로드 성공 (Embedded):", result.teams.length + "개 팀");

                    // [Debug] Check specific permissions for CallCenterTeam
                    if (result.permissionMap['CallCenterTeam']) {
                        const ccPerms = result.permissionMap['CallCenterTeam'];
                        console.log("🔍 [Debug] CallCenterTeam Permissions Check:");
                        console.log(`Row 18: ${ccPerms[18]}`);
                        console.log(`Row 19: ${ccPerms[19]}`);
                        console.log(`Row 20: ${ccPerms[20]}`);
                    } else {
                        console.warn("⚠️ CallCenterTeam not found in permission map");
                    }

                } else {
                    console.error("엑셀 파싱 실패: 결과가 비어있음");
                }
            } catch (err) {
                console.error("데이터 로딩 심각한 오류:", err);
            } finally {
                setLoading(false);
            }
        };
        // Run immediately
        loadData();
    }, []);

    const handleCreatePersona = (name, perms) => {
        const newVirtual = { name: `[Virtual] ${name}`, permissions: perms };
        setData(prev => ({
            ...prev,
            teams: [...prev.teams, newVirtual.name],
            permissionMap: {
                ...prev.permissionMap,
                [newVirtual.name]: newVirtual.permissions
            }
        }));
        return newVirtual;
    };

    const handleJsonExport = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `permission_data_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    return { data, loading, handleCreatePersona, handleJsonExport };
}
