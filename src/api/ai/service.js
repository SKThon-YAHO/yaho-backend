// src/ai/insight.js
// 목적: 화장실 방문/설문 원본 로그(타임스탬프 포함)를 Claude API에 넘겨서
//       시간대/요일 패턴까지 반영한 자연어 인사이트를 생성

import anthropic from './client.js';

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

이 데이터를 보고 다음을 파악해서 한국어로 2~3문장짜리 인사이트를 작성하세요:
1. 가장 시급한 문제가 무엇인지
2. 방문/신고가 몰리는 시간대가 있다면 그것
3. 지금 시간을 확인하고 관리자가 바로 할 수 있는 행동 제안 하나

문체 규칙 (반드시 지키세요):
- 짧고 간결한 문장만 쓰세요. 한 문장은 최대 40자 내외로.
- "~를 의미합니다", "~로 보입니다", "~해야 합니다", "~하시기 바랍니다", "~할 필요가 있습니다" 같은 길고 딱딱한 문어체 표현은 쓰지 마세요.
- 대신 "~예요", "~해보세요", "~가 많아요" 같은 짧고 직접적인 말투를 쓰세요.
- 불필요한 인사말, 서론 없이 바로 본문만 작성하세요.
- 데이터가 너무 적으면 짧게 "아직 데이터가 적어요"라고만 말하세요.
- 강조해야할 단어나 말은 중괄호안에 넣으세요.

[방문 로그]
${formatUsageLogs(usageLogs)}

[설문(문제 신고) 로그]
${formatSurveyLogs(surveyLogs)}

[현재시각]
${new Date().toISOString()}
`.trim();
};

const generateInsight = async (usageLogs, surveyLogs) => {
    const prompt = buildPrompt(usageLogs, surveyLogs);

    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : '';
};

export { generateInsight };