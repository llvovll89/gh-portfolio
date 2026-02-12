/**
 * 마크다운 텍스트에서 예상 읽기 시간을 계산합니다.
 * @param markdown - 원본 마크다운 내용
 * @returns 한국어로 포맷된 읽기 시간 문자열 (예: "5분 읽기")
 */
export function calculateReadingTime(markdown: string): string {
    // 마크다운 문법 제거
    const plainText = stripMarkdown(markdown);

    // 한글(음절)과 영어(단어) 개수 세기
    const koreanChars = countKoreanCharacters(plainText);
    const englishWords = countEnglishWords(plainText);

    // 읽기 시간 계산
    // 한글: 분당 300자(이해 시간 포함)
    // 영어: 분당 200단어
    const koreanMinutes = koreanChars / 300;
    const englishMinutes = englishWords / 180;
    const totalMinutes = koreanMinutes + englishMinutes;

    // 소수점 반올림, 최소 1분
    const readingMinutes = Math.max(1, Math.round(totalMinutes));

    return `${readingMinutes}분 읽기`;
}

/**
 * 마크다운 포맷을 제거하여 순수 텍스트만 추출합니다.
 */
function stripMarkdown(markdown: string): string {
    let text = markdown;

    // 코드 블록(```...```) 제거 시 아래 주석 해제
    // text = text.replace(/```[\s\S]*?```/g, '');

    // 인라인 코드(`...`) 제거 시 아래 주석 해제
    // text = text.replace(/`[^`]+`/g, '');

    // 이미지 (![alt](url)) 제거
    text = text.replace(/!\[.*?\]\(.*?\)/g, '');

    // 링크는 텍스트만 남김 ([text](url) -> text)
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 헤더(# ## ### 등) 제거
    text = text.replace(/^#{1,6}\s+/gm, '');

    // 볼드/이탤릭(**text** 또는 *text*) 제거
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');

    // 인용문(> text) 제거
    text = text.replace(/^>\s+/gm, '');

    // 구분선(--- 또는 ***) 제거
    text = text.replace(/^[-*]{3,}$/gm, '');

    // 리스트 마커(-, *, 1. 등) 제거
    text = text.replace(/^[\s]*[-*+]\s+/gm, '');
    text = text.replace(/^[\s]*\d+\.\s+/gm, '');

    // HTML 태그 제거
    text = text.replace(/<[^>]+>/g, '');

    return text.trim();
}

/**
 * 한글(음절) 개수 세기
 */
function countKoreanCharacters(text: string): number {
    // 한글 유니코드 범위: Hangul Syllables (AC00-D7AF),
    // Hangul Jamo (1100-11FF), Hangul Compatibility Jamo (3130-318F)
    const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g;
    const matches = text.match(koreanRegex);
    return matches ? matches.length : 0;
}

/**
 * 영어 단어 개수 세기
 */
function countEnglishWords(text: string): number {
    // 한글 문자 먼저 제거
    const textWithoutKorean = text.replace(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, '');

    // 공백 기준으로 분리 후, 영문/숫자 포함 단어만 필터링
    const words = textWithoutKorean
        .split(/\s+/)
        .filter(word => word.length > 0 && /[a-zA-Z0-9]/.test(word));

    return words.length;
}
