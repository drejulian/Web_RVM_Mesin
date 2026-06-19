# Mesin RVM - Display Application

Aplikasi display untuk mesin RVM (Reverse Vending Machine) yang menampilkan QR code dan aktivitas bottle-in secara real-time.

## Deskripsi

Aplikasi ini dibuat untuk ditampilkan di layar mesin RVM. Aplikasi ini:
- Menampilkan QR code yang mengarah ke halaman `/bottlein` di web_rvm
- Menampilkan aktivitas deteksi botol secara real-time
- Tersinkronisasi dengan aplikasi web_rvm melalui Socket.IO
- Tidak memerlukan autentikasi (public display)
- Tidak mengubah database (read-only display)

## Teknologi

- **Next.js 15** - React framework
- **Socket.IO Client** - Real-time communication
- **QRCode.react** - QR code generation
- **Tailwind CSS** - Styling

## Instalasi

Dependencies sudah terinstall. Jika perlu install ulang:

```bash
npm install
```

## Konfigurasi

Edit file `.env.local` untuk mengatur URL web_rvm:

```env
WEB_RVM_URL=https://rvmapps.netlify.app
NEXT_PUBLIC_WEB_RVM_URL=https://rvmapps.netlify.app
```

**Catatan:**
- `WEB_RVM_URL` - URL server web_rvm (untuk server-side)
- `NEXT_PUBLIC_WEB_RVM_URL` - URL web_rvm (untuk client-side, Socket.IO connection, dan QR code)

Untuk production, ganti dengan URL yang sesuai:
```env
NEXT_PUBLIC_WEB_RVM_URL=https://rvmapps.netlify.app
```

Localhost hanya dipakai otomatis saat development jika env belum diset. Di production, aplikasi harus diarahkan ke URL deploy web user.

## Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3002`

### Production Mode

```bash
npm run build
npm start
```

## Cara Kerja

### Arsitektur

```
Arduino → web_rvm (/api/bottle-count/arduino)
              ↓
         Socket.IO Broadcast
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
mesin_rvm          web_rvm/bottlein
(display)          (user mobile)
```

### Flow

1. **QR Code Display**: Mesin menampilkan QR code yang mengarah ke `{WEB_RVM_URL}/bottlein`
2. **User Scan**: User scan QR code dengan smartphone
3. **Socket.IO Connection**: 
   - mesin_rvm terhubung ke web_rvm Socket.IO server
   - User (bottlein page) juga terhubung ke Socket.IO server yang sama
4. **Bottle Detection**: 
   - Arduino mengirim deteksi botol ke web_rvm
   - web_rvm broadcast via Socket.IO
   - mesin_rvm dan bottlein page menerima update secara real-time
5. **Sinkronisasi**: Kedua layar (mesin dan user mobile) menampilkan jumlah botol yang sama

### Fitur

- ✅ QR code dinamis berdasarkan WEB_RVM_URL
- ✅ Real-time bottle detection display
- ✅ Visual feedback (animation) saat botol terdeteksi
- ✅ Audio notification saat botol terdeteksi
- ✅ Status koneksi indicator
- ✅ Estimasi poin display
- ✅ Instruksi penggunaan

## Struktur Proyek

```
E:\mesin_rvm\
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout
│   │   ├── page.js            # Main display page (QR + Activity)
│   │   └── globals.css        # Global styles
│   └── hooks/
│       └── use-socket-client.js  # Socket.IO hook
├── public/                     # Static assets
├── .env.local                  # Environment configuration
├── package.json                # Dependencies & scripts
├── next.config.mjs            # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                   # Documentation
```

## Port Configuration

- **web_rvm**: Port 3000 (default)
- **mesin_rvm**: Port 3002 (configured in package.json)
- **WEB_RVM_ADMIN**: Port lain (tergantung konfigurasi)

## Troubleshooting

### Socket.IO tidak terhubung

1. Pastikan `NEXT_PUBLIC_WEB_RVM_URL` sudah mengarah ke URL deploy web user
2. Cek env tersebut di platform deployment, lalu rebuild aplikasi
3. Cek console browser untuk error messages
4. Pastikan CORS di web_rvm mengizinkan koneksi dari mesin_rvm

### QR Code tidak muncul

1. Cek NEXT_PUBLIC_WEB_RVM_URL di .env.local
2. Pastikan URL valid dan dapat diakses
3. Restart aplikasi setelah mengubah .env.local

### Bottle count tidak update

1. Cek koneksi Socket.IO (lihat status indicator)
2. Pastikan web_rvm Socket.IO server berjalan dengan baik
3. Cek console untuk error messages
4. Test dengan trigger bottle detection di Arduino

## Development Notes

- **Tidak mengubah database**: Aplikasi ini hanya membaca/display data
- **Tidak ada autentikasi**: Public display untuk mesin
- **Tidak ada claim functionality**: User melakukan claim di smartphone mereka
- **Socket.IO connection**: Menghubungkan ke web_rvm server (bukan local server)

## Menjalankan Bersama web_rvm

### Terminal 1 - Web RVM (User App)
```bash
cd E:\web_rvm
npm run dev
```

### Terminal 2 - Mesin RVM (Display)
```bash
cd E:\mesin_rvm
npm run dev
```

Akses:
- User app: http://localhost:3000
- Mesin display: http://localhost:3002

## Production Deployment

1. Update .env.local dengan production URL
2. Build aplikasi:
   ```bash
   npm run build
   ```
3. Run production server:
   ```bash
   npm start
   ```

Untuk deployment di mesin fisik, pastikan:
- Mesin dapat akses web_rvm server
- Network configuration memungkinkan Socket.IO connection
- Display di mesin dalam fullscreen mode

## License

Private project - Internal use only
