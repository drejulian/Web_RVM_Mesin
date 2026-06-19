import './globals.css';

export const metadata = {
  title: 'Mesin RVM - Display',
  description: 'Real-time bottle detection display for RVM machine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
