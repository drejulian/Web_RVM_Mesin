import './globals.css';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Mesin RVM - Display',
  description: 'Real-time bottle detection display for RVM machine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
