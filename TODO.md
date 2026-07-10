# Bekleyen İşler / Bilinen Durumlar

## Açık

- **(2026-07-08) Branch main'e merge edilmedi:** `claude/shifts-cleanup-online-staff-bggahc` GitHub'a push edildi ama henüz PR açılıp main'e birleştirilmedi. PR: https://github.com/Bromer-Coding/SahaPanel/pull/new/claude/shifts-cleanup-online-staff-bggahc
- **(2026-07-08) Supabase performans uyarıları (schema genelinde, bu branch'ten bağımsız, dokunulmadı):** `get_advisors` birçok tabloda RLS politikalarının `auth.<fn>()` çağrısını her satırda yeniden değerlendirdiğini (`auth_rls_initplan`) ve bazı tablolarda (`departments`, `profiles`, `shift_boards`, `shifts`) aynı işlem için birden fazla permissive policy olduğunu (`multiple_permissive_policies`) bildiriyor. Performans etkisi düşük ölçekte önemsiz; veri/kullanıcı sayısı büyürse ele alınmalı. Detay: `supabase/schema.sql` RLS bölümü.
- **(2026-07-08) `profiles_is_online_idx` henüz kullanılmadı:** Yeni eklenen bir indeks olduğu için normal; trafik arttıkça Supabase advisor'da "unused index" uyarısı kendiliğinden düşmeli.

## Çözüldü

- ~~Supabase ortam değişkenleri Vercel'de eksikti (`NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`), `/dashboard` sayfasında 42 hata / 6 kullanıcı etkilenmişti~~ — 2026-07-08 itibarıyla env'ler eklenmiş ve sonraki deploy ile giderilmiş durumda (bkz. [CHANGELOG.md](CHANGELOG.md)).
- ~~`profiles.is_online`/`last_seen_at` migration'ı elle SQL editöründe çalıştırılması gerekiyordu~~ — 2026-07-08'de doğrudan uygulandı.
## 2026-07-08 - Redesign kontrolu

- [ ] Yeni tasarimi production deploy sonrasinda masaustu ve mobil ekranda gorsel olarak kontrol et.
- [ ] Login/kayit, dashboard, duyurular, kayit istekleri ve vardiya plani ekranlarinda koyu tema okunurlugunu kontrol et.
