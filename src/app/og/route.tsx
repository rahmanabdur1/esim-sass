import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title    = searchParams.get('title')    ?? 'eSIM Platform';
  const subtitle = searchParams.get('subtitle') ?? 'Global Connectivity';

  return new ImageResponse(
    (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)', fontFamily:'system-ui,sans-serif', padding:'60px' }}>
        <div style={{ color:'#f8fafc', fontSize:'72px', fontWeight:800, textAlign:'center', lineHeight:1.1, marginBottom:'20px', maxWidth:'900px' }}>{title}</div>
        <div style={{ color:'#94a3b8', fontSize:'28px', textAlign:'center' }}>{subtitle}</div>
        <div style={{ position:'absolute', bottom:'40px', color:'#475569', fontSize:'18px' }}>esimplatform.com</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
