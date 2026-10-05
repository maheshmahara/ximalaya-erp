import type { Metadata } from 'next';
import '@/styles/tokens.css';

export const metadata: Metadata = {
  title: 'Ximalaya Coffee Group | Enterprise ERP',
  description: 'Plant-to-cup traceability and ERP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
