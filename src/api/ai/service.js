// src/ai/insight.js
// 목적: 화장실 방문/설문 원본 로그(타임스탬프 포함)를 Claude API에 넘겨서
//       시간대/요일 패턴까지 반영한 자연어 인사이트를 생성

import anthropic from './client.js';

// 원본 로그를 프롬프트에 넣기 좋은 간결한 텍스트로 변환
const formatUsageLogs = (usageLogs) => {
    if (usageLogs.length === 0) return '(방문 기록 없음)';
    return usageLogs
        .map((log) => `${log.name} | ${new Date(log.created_at).toISOString()}`)
        .join('\n');
};

const formatSurveyLogs = (surveyLogs) => {
    if (surveyLogs.length === 0) return '(설문 기록 없음)';
    return surveyLogs
        .map((log) => {
            const s = log.survey;
            const issues = [];
            if (s.clean) Object.entries(s.clean).forEach(([k, v]) => v && issues.push(`clean.${k}`));
            if (s.break) Object.entries(s.break).forEach(([k, v]) => v && issues.push(`break.${k}`));
            if (s.item) Object.entries(s.item).forEach(([k, v]) => v && issues.push(`item.${k}`));
            const issueText = issues.length > 0 ? issues.join(', ') : '이상없음';
            return `${log.name} | ${new Date(log.created_at).toISOString()} | ${issueText}`;
        })
        .join('\n');
};

const buildPrompt = (usageLogs, surveyLogs) => {
    return `
당신은 공중화장실 관리 데이터를 분석해서 관리자에게 조언을 주는 어시스턴트입니다.
아래는 이번 달 방문 기록과 설문(문제 신고) 기록의 원본 로그입니다. 각 줄은 "화장실명 | 시각(UTC) | 신고내용" 형식입니다.

이 데이터를 보고 다음을 파악해서 한국어로 4~5문장짜리 간결한 인사이트를 작성하세요:
1. 방문이 몰리는 시간대/요일이 있는지
2. 문제 신고(청결/파손/비품)가 특정 시간대에 집중되는 패턴이 있는지
3. 가장 시급한 문제가 무엇인지
4. 관리자가 취할 수 있는 구체적인 행동(예: 몇 시에 청소를 추가하면 좋을지)

불필요한 인사말 없이 바로 본문만 작성하세요. 데이터가 너무 적어 패턴을 판단하기 어려우면 그렇게 솔직히 말하세요.

[방문 로그]
${formatUsageLogs(usageLogs)}

[설문(문제 신고) 로그]
${formatSurveyLogs(surveyLogs)}
`.trim();
};

const generateInsight = async (usageLogs, surveyLogs) => {
    const prompt = buildPrompt(usageLogs, surveyLogs);

    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : '';
};

export { generateInsight };