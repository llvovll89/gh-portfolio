// 공개 댓글 문서에 남아 있는 레거시 pwHash 를 blog_comment_secrets 로 이관 (1회성)
// 사용: FIREBASE_SERVICE_ACCOUNT='<json>' node scripts/migrate-comment-secrets.mjs [--dry-run]
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT 환경변수가 필요합니다.");
    process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const account = JSON.parse(raw);
initializeApp({
    credential: cert({
        projectId: account.project_id,
        clientEmail: account.client_email,
        privateKey: account.private_key.replace(/\\n/g, "\n"),
    }),
});

const db = getFirestore();
const snapshot = await db.collectionGroup("entries").get();
let moved = 0;

for (const doc of snapshot.docs) {
    // blog_comments/{slug}/entries/{id} 만 대상
    if (doc.ref.parent.parent?.parent.id !== "blog_comments") continue;
    const pwHash = doc.get("pwHash");
    if (typeof pwHash !== "string") continue;

    const slug = doc.ref.parent.parent.id;
    moved++;
    console.log(`${dryRun ? "[dry-run] " : ""}${slug}/${doc.id}`);
    if (dryRun) continue;

    const batch = db.batch();
    batch.set(db.collection("blog_comment_secrets").doc(slug).collection("entries").doc(doc.id), { pwHash }, { merge: true });
    batch.update(doc.ref, { pwHash: FieldValue.delete() });
    await batch.commit();
}

console.log(`${dryRun ? "이관 대상" : "이관 완료"}: ${moved}건`);
