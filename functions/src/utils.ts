import { getFirestore, FieldValue } from "firebase-admin/firestore";

// emulator 環境允許所有來源，正式環境只允許自己的 Hosting 網域
export const ALLOWED_ORIGINS: boolean | string[] =
  process.env.FUNCTIONS_EMULATOR === "true"
    ? true
    : ["https://search-food-497209.web.app", "https://search-food-497209.firebaseapp.com"];

// 限流功能：每個 IP 每分鐘最多 30 次請求
export async function checkRateLimit(ip: string, limitPerMin = 30): Promise<boolean> {
  const bucket = Math.floor(Date.now() / 60_000);
  const ref = getFirestore().collection("rate_limits").doc(`${ip}_${bucket}`);

  await ref.set({ count: FieldValue.increment(1), expireAtBucket: bucket + 2 }, { merge: true });
  const snap = await ref.get();
  return ((snap.data()?.count as number) ?? 0) <= limitPerMin;
}
