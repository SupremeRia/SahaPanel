# Değişiklik Günlüğü

Bu dosya, projede yapılan önemli değişikliklerin kısa ve tarihli özetini tutar. Ayrıntılı kod düzeyi geçmiş için `git log` kullanın.

## 2026-07-08

- **Vardiyalar sayfası sadeleştirildi** (branch `claude/shifts-cleanup-online-staff-bggahc`, commit `51cfb14`): Liste/takvim görünümü, arama/filtre ve "Yeni vardiya" formu kaldırıldı; sadece haftalık plan görselini yükleme/galeri alanı kaldı. `createShift`/`updateShift`/`deleteShift` server action'ları ve ilişkili kullanılmayan kod temizlendi.
- **Dashboard'a "Çevrimiçi Personeller" kartı eklendi** (aynı commit): Giriş/çıkış ve panel açıkken periyodik heartbeat (`pingPresence` server action, `components/presence-heartbeat.tsx`) ile `profiles.is_online`/`last_seen_at` güncelleniyor; dashboard son 3 dakika içinde aktif olanları "çevrimiçi" sayıyor.
- **Supabase şema değişikliği:** `profiles` tablosuna `is_online boolean not null default false` ve `last_seen_at timestamptz` kolonları ile `profiles_is_online_idx` (`is_online, last_seen_at`) indeksi eklendi (`supabase/schema.sql`). Migration `add_profile_presence_columns` adıyla production veritabanına uygulandı.
- **Kod temizliği** (commit `5add260`): `login-form.tsx` giriş sonrası `is_online`/`last_seen_at` alanlarını tarayıcıdan doğrudan güncelliyordu; bu, `signOut`/heartbeat'in kullandığı `pingPresence` server action'ından ayrı bir yoldu. Tek yola (`pingPresence`) birleştirildi.
- **GitHub push:** Yukarıdaki değişiklikler `Bromer-Coding/SahaPanel` reposuna `claude/shifts-cleanup-online-staff-bggahc` branch'i olarak push edildi (main'e henüz merge edilmedi, bkz. [TODO.md](TODO.md)).
- **Vercel/Supabase entegrasyon kontrolü:** Production'da 2026-07-07/08 arasında görülen "Supabase URL/Key required" hatası (42 kayıt, 6 kullanıcı, `/dashboard`) incelendi; env değişkenleri (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) zaten eklenmiş ve sonraki deploy bu hatayı gidermişti — ek aksiyon gerekmedi.
- **Build/test durumu:** `npm run typecheck`, `npm run lint` ve `npm run build` yukarıdaki tüm değişikliklerle birlikte başarılı.
## 2026-07-08 - Redesign paketi

- `SahaPanelredesign.zip` icerigi `Bromer-Coding/SahaPanel` main dali baz alinarak projeye alindi.
- Degisiklikler agirlikli olarak tema, global stil, login/kayit ekrani, navigasyon, ortak UI bilesenleri ve uygulama ikonlarini etkiler.
- Supabase tablo/kolon/policy degisikligi yapilmadi.
- `npm install` ve `npm run build` basarili gecti.
