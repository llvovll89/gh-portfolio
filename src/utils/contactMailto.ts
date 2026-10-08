export function buildContactMailto(recipient: string, subject: string, body: string) {
    const singleLineSubject = subject.replace(/[\r\n]+/g, " ");
    return `mailto:${recipient}?subject=${encodeURIComponent(singleLineSubject)}&body=${encodeURIComponent(body)}`;
}
