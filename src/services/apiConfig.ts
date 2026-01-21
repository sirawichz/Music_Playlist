// ตรวจสอบว่าอยู่ในโหมด Production ด้วยตัวแปรของ Vite
const isProduction = import.meta.env.PROD;

// Production เรียก iTunes โดยตรง, Development ใช้ Proxy เพื่อลดปัญหา CORS
export const itunesBaseUrl = isProduction
  ? 'https://itunes.apple.com'
  : '/api/itunes';

export const musicApiEndpoints = {
  search: `${itunesBaseUrl}/search`,
  lookup: `${itunesBaseUrl}/lookup`,
};
