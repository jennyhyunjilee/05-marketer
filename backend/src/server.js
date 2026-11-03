import express from 'express';
import cors from 'cors';

const app = express();
// Vercel 프론트엔드 주소만 허용합니다. (Render 환경변수 FRONTEND_ORIGIN)
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? '*' }));
app.use(express.json());

// Render 헬스 체크용
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`backend listening on ${port}`);
});
