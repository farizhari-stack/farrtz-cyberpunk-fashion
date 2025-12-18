# 🚀 FARRTZ Cyberpunk Fashion - Deployment Guide

## ✨ AUTOMATIC SETUP (RECOMMENDED)

### Cara Paling Mudah - Tidak Perlu SQL Manual!

1. **Deploy ke Vercel** dengan environment variables:
   - `VITE_SUPABASE_URL` = URL project Supabase Anda
   - `VITE_SUPABASE_ANON_KEY` = Anon key dari Supabase

2. **Pastikan tabel sudah ada** di Supabase (jalankan `2_create_tables.sql` dan `3_rls_policies.sql` sekali saja)

3. **Buka halaman admin**: `/admin`
   - Jika belum ada admin → Otomatis tampil form "First Time Setup"
   - Isi form dengan:
     - Nama
     - Email
     - Password
     - **Setup Code**: `FARRTZ_SETUP_2024`
   - Klik Register → Admin pertama dibuat!

4. **Selesai!** Anda langsung bisa login dengan credentials yang baru dibuat.

---

## 📋 Setup Supabase (Satu Kali Saja)

### 1. Buat Project di Supabase
1. Buka https://supabase.com
2. Create new project
3. Catat **Project URL** dan **anon key** dari Settings → API

### 2. Create Tables
1. Buka **SQL Editor**
2. Jalankan file `2_create_tables.sql`
3. Jalankan file `3_rls_policies.sql`

### 3. (Opsional) Disable Email Confirmation
Untuk development, Anda bisa disable email confirmation:
1. Buka **Authentication** → **Providers** → **Email**
2. Toggle off "Confirm email"

---

## 🌐 Deploy ke Vercel

### Environment Variables
| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR...` |
| `VITE_SETUP_CODE` | (opsional) Custom setup code untuk admin pertama |
| `VITE_ADMIN_CODE` | (opsional) Custom code untuk tambah admin berikutnya |

### Build Settings
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 🔑 Kode Registrasi Admin

### Untuk Admin PERTAMA (First Time Setup)
```
FARRTZ_SETUP_2024
```
Atau set custom via env: `VITE_SETUP_CODE`

### Untuk Admin TAMBAHAN
```
FARRTZ_ADMIN_2024
```
Atau set custom via env: `VITE_ADMIN_CODE`

---

## 🔄 Reset Password Admin

1. Buka halaman admin login
2. Klik "Forgot Password?"
3. Masukkan email admin
4. Cek inbox untuk link reset

---

## 📁 File SQL Reference

| File | Kapan Dijalankan |
|------|------------------|
| `1_reset_database.sql` | Hanya jika ingin hapus semua data |
| `2_create_tables.sql` | Sekali saat setup awal |
| `3_rls_policies.sql` | Sekali saat setup awal |
| `4_insert_admin.sql` | TIDAK PERLU jika pakai auto setup |

---

## ❓ Troubleshooting

### Error "Not authorized as admin"
- Pastikan record user ada di tabel `users` dengan `isAdmin = true`
- Gunakan fitur "Register Admin" dengan Setup Code

### Halaman tidak muncul
- Pastikan environment variables sudah di-set
- Cek browser console untuk error

### Email verification tidak masuk
- Cek spam folder
- Atau disable email confirmation di Supabase settings

---

Made with ❤️ by FARRTZ Team
