
/**
 * Generates a Markdown formatted permission specification for selected teams.
 * 
 * @param {Object} data - The full data object containing menuStructure and permissionMap
 * @param {Array<string>} selectedTeams - List of selected team names
 * @returns {string} - The generated Markdown content
 */
export const generateMarkdown = (data, selectedTeams) => {
    if (!data || !selectedTeams || selectedTeams.length === 0) {
        return '# Permission Specification\n\nNo teams selected.';
    }

    const date = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    let md = `# 권한 명세서 (Permission Specification)\n\n`;
    md += `**생성일:** ${date}\n`;
    md += `**대상 팀:** ${selectedTeams.join(', ')}\n\n`;
    md += `---\n\n`;

    // Function to traverse menu structure
    const traverse = (nodes, team, depth = 0) => {
        let content = '';
        const padding = '  '.repeat(depth);

        for (const node of nodes) {
            const viewItem = node.items && node.items.find(i => i.type === 'view');
            const isPage = !!viewItem;

            if (isPage) {
                // [v6.11.24] 사이드바와 동일한 로직: node.items 중 하나라도 권한이 있으면 접근 가능
                // (MainContent.jsx의 checkNode 로직과 일치)
                const isPageAccessible = node.items?.some(item =>
                    data.permissionMap[team]?.[item.id] === true
                ) ?? false;

                const pageIcon = isPageAccessible ? '✅' : '🚫';
                const pageStatus = isPageAccessible ? '**접근 허용**' : '접근 차단';

                content += `${padding}- ${pageIcon} **${node.name}** (${node.fullPath}) - ${pageStatus}\n`;

                // 버튼/드롭다운 아이템 목록 출력
                if (node.items && node.items.length > 1) {
                    node.items.forEach(item => {
                        if (item.type === 'view') return;
                        const hasPerm = data.permissionMap[team]?.[item.id] === true;
                        const icon = hasPerm ? '✅' : '❌';
                        const status = hasPerm ? '**허용**' : '차단';
                        content += `${padding}    - ${icon} ${item.name} [${item.type}]: ${status}\n`;
                    });
                }
            } else if (node.children && node.children.length > 0) {
                // Folder / Category
                content += `${padding}- 📂 **${node.name}**\n`;
                content += traverse(node.children, team, depth + 1);
            }
        }
        return content;
    };

    selectedTeams.forEach(team => {
        md += `## 👤 팀: ${team}\n\n`;

        // Calculate summary stats
        const totalPerms = Object.values(data.permissionMap[team] || {}).filter(Boolean).length;
        md += `> **요약:** 총 ${totalPerms}개의 권한이 부여되어 있습니다.\n\n`;

        md += `### 권한 상세 목록\n`;
        md += traverse(data.menuStructure, team);
        md += `\n---\n\n`;
    });

    return md;
};
