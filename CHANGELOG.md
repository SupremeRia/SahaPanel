# Değişiklik Günlüğü

Bu dosya, projede yapılan önemli değişikliklerin kısa ve tarihli özetini tutar. Ayrıntılı kod düzeyi geçmiş için `git log` kullanın.

## 2026-07-08 (2. kontrol — GitHub/Vercel/Supabase bağlantı doğrulama)

- **GitHub:** `claude/shifts-cleanup-online-staff-bggahc` branch'i PR #4 olarak main'e merge edildi (merge commit `f1c4e02`, merge eden: SupremeRia). Repo bağlantısı ve erişim sorunsuz.
- **Vercel:** GitHub entegrasyonu doğru repoya (`Bromer-Coding/SahaPanel`) bağlı olduğu doğrulandı; main'e merge otomatik olarak yeni bir production deploy tetikledi (`dpl_Fr5eeABrosEzMtCQY61epBvDsTfo`, READY, build hatasız). Framework (Next.js), build/output ayarları (framework varsayılanları) ve env değişkenleri (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) doğru ve eksiksiz.
- **Supabase — bulunan gerçek sorun:** Postgres loglarında her 60 saniyede bir tekrarlayan `current transaction is aborted` hatası tespit edildi. Kök neden bulundu: uygulama kodu değil, Supabase'in kendi iç izleme bağlantısı (`postgres_exporter`) takılı kalmış durumda. Kullanıcı trafiğini etkilemiyor (REST API logları tamamen 200 OK). Ayrıntı ve öneri için [TODO.md](TODO.md).
- **Doğrulanan özellikler (main üzerinde, bozulmamış):** Kayıt onayı RPC doğrulaması, duyuru okunmamış sayacı (kullanıcı bazlı), Vardiyalar sayfası (sadece haftalık plan görseli), Çevrimiçi Personeller kartı, Supabase client env kullanımı (`lib/supabase/browser.ts`, `lib/supabase/server.ts`).
- Kod değişikliği yapılmadı; bu tur sadece doğrulama ve dokümantasyon güncellemesiydi.

## 2026-07-08

- **Vardiyalar sayfası sadeleştirildi** (branch `claude/shifts-cleanup-online-staff-bggahc`, commit `51cfb14`): Liste/takvim görünümü, arama/filtre ve "Yeni vardiya" formu kaldırıldı; sadece haftalık plan görselini yükleme/galeri alanı kaldı. `createShift`/`updateShift`/`deleteShift` server action'ları ve ilişkili kullanılmayan kod temizlendi.
- **Dashboard'a "Çevrimiçi Personeller" kartı eklendi** (aynı commit): Giriş/çıkış ve panel açıkken periyodik heartbeat (`pingPresence` server action, `components/presence-heartbeat.tsx`) ile `profiles.is_online`/`last_seen_at` güncelleniyor; dashboard son 3 dakika içinde aktif olanları "çevrimiçi" sayıyor.
- **Supabase şema değişikliği:** `profiles` tablosuna `is_online boolean not null default false` ve `last_seen_at timestamptz` kolonları ile `profiles_is_online_idx` (`is_online, last_seen_at`) indeksi eklendi (`supabase/schema.sql`). Migration `add_profile_presence_columns` adıyla production veritabanına uygulandı.
- **Kod temizliği** (commit `5add260`): `login-form.tsx` giriş sonrası `is_online`/`last_seen_at` alanlarını tarayıcıdan doğrudan güncelliyordu; bu, `signOut`/heartbeat'in kullandığı `pingPresence` server action'ından ayrı bir yoldu. Tek yola (`pingPresence`) birleştirildi.
- **GitHub push:** Yukarıdaki değişiklikler `Bromer-Coding/SahaPanel` reposuna `claude/shifts-cleanup-online-staff-bggahc` branch'i olarak push edildi (main'e henüz merge edilmedi, bkz. [TODO.md](TODO.md)).
- **Vercel/Supabase entegrasyon kontrolü:** Production'da 2026-07-07/08 arasında görülen "Supabase URL/Key required" hatası (42 kayıt, 6 kullanıcı, `/dashboard`) incelendi; env değişkenleri (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) zaten eklenmiş ve sonraki deploy bu hatayı gidermişti — ek aksiyon gerekmedi.
- **Build/test durumu:** `npm run typecheck`, `npm run lint` ve `npm run build` yukarıdaki tüm değişikliklerle birlikte başarılı.
