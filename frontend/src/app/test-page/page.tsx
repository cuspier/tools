import React from 'react';

export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#0070f3' }}>Vercel Deployment Test Page</h1>
      <p>If you can see this page, the Vercel build and routing are working correctly!</p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fafafa', borderRadius: '5px', border: '1px solid #eee' }}>
        <p><strong>Deployment Time:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Route:</strong> /test-page</p>
      </div>
    </div>
  );
}
