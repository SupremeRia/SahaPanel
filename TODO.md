# Bekleyen İşler / Bilinen Durumlar

## Açık

- **(2026-07-08) Supabase'de "postgres_exporter" bağlantısı aborted-transaction durumunda takılı:** Postgres loglarında her tam 60 saniyede bir tekrarlayan `current transaction is aborted, commands ignored until end of transaction block` hataları görüldü. Kaynağı `pg_stat_activity` ile bulundu: bu, uygulama kodumuzla/şemamızla ilgisi olmayan, Supabase'in kendi iç izleme bağlantısı (`application_name=postgres_exporter`, `user=supabase_admin`), `set statement_timeout to '20s'` komutunda takılı kalmış ve "idle in transaction (aborted)" durumunda. REST API logları ve Vercel runtime hataları bundan etkilenmiyor (tüm kullanıcı istekleri 200 dönüyor) — yani şu an fonksiyonel bir kullanıcı etkisi yok, sadece Supabase log ekranında gürültü. `pg_terminate_backend()` ile bu bağlantıyı sonlandırmayı denedim ama bu, paylaşılan altyapıda yıkıcı/onaysız bir aksiyon olduğu için otomatik olarak engellendi. **Öneri:** Supabase Dashboard → Project Settings → General → "Restart project" ile temizlenebilir, ya da Supabase destek ekibine bildirilebilir.
- **(2026-07-08) Supabase performans uyarıları (schema genelinde, bağımsız, dokunulmadı):** `get_advisors` birçok tabloda RLS politikalarının `auth.<fn>()` çağrısını her satırda yeniden değerlendirdiğini (`auth_rls_initplan`) ve bazı tablolarda (`departments`, `profiles`, `shift_boards`, `shifts`) aynı işlem için birden fazla permissive policy olduğunu (`multiple_permissive_policies`) bildiriyor. Performans etkisi düşük ölçekte önemsiz; veri/kullanıcı sayısı büyürse ele alınmalı. Detay: `supabase/schema.sql` RLS bölümü.
- **(2026-07-08) `profiles_is_online_idx` henüz kullanılmadı:** Yeni eklenen bir indeks olduğu için normal; trafik arttıkça Supabase advisor'da "unused index" uyarısı kendiliğinden düşmeli.

## Çözüldü

- ~~Branch main'e merge edilmedi~~ — `claude/shifts-cleanup-online-staff-bggahc`, PR #4 olarak 2026-07-08 17:44'te SupremeRia tarafından main'e merge edildi (commit `f1c4e02`); Vercel bu merge'ü otomatik yakalayıp production'a deploy etti (`dpl_Fr5eeABr...`, READY).
- ~~Supabase ortam değişkenleri Vercel'de eksikti (`NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`), `/dashboard` sayfasında 42 hata / 6 kullanıcı etkilenmişti~~ — 2026-07-08 itibarıyla env'ler eklenmiş ve sonraki deploy ile giderilmiş durumda (bkz. [CHANGELOG.md](CHANGELOG.md)).
- ~~`profiles.is_online`/`last_seen_at` migration'ı elle SQL editöründe çalıştırılması gerekiyordu~~ — 2026-07-08'de doğrudan uygulandı.
