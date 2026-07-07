# SahaPanel

SahaPanel; WhatsApp grup karmaşası yerine duyuru, görev, arıza, vardiya ve personel takibini tek panelde toplamak için hazırlanmış, responsive bir saha operasyon yönetim panelidir. Petrol istasyonu, market, saha ekibi ve vardiyalı çalışan takımlar için yapılandırılmış bir iş akışı sunar.

## Öne çıkan özellikler

- Tüm modüllerde tam CRUD: kayıt oluşturma, düzenleme ve silme
- Arama ve filtreleme desteği (durum, kategori, öncelik vb.)
- Koyu tema (dark mode) desteği
- Anlık bildirimler (toast) ile kullanıcı geri bildirimi
- PWA kurulumu: uygulamayı ana ekrana ekleyip mobilde açma
- Görev öncelikleri (Düşük / Normal / Yüksek / Acil) ve geciken görev takibi
- Arıza önem derecesi (Düşük / Orta / Yüksek / Kritik) ve fotoğraf büyütme (lightbox)
- Vardiya takvimi görünümü
- CSV olarak dışa aktarma
- Supabase RLS ile rol bazlı erişim kontrolü
- Türkçe tipografi ve doğru diakritik kullanımı

## Teknolojiler

- Next.js 16 (App Router)
- React 19
- Supabase Auth, Database, Storage
- Tailwind CSS
- TypeScript
- Lucide React ikonları

## Ekranlar ve modüller

| Yol | Açıklama |
| --- | --- |
| `/login` | Supabase Auth ile oturum açma |
| `/dashboard` | Genel özet ve modüllere hızlı erişim |
| `/announcements` | Duyurular, sabitleme ve okundu takibi |
| `/tasks` | Görevler, öncelik ve durum yönetimi, geciken görevler |
| `/faults` | Arıza kayıtları, önem derecesi ve fotoğraf yükleme |
| `/shifts` | Vardiya listesi ve takvim görünümü |
| `/personnel` | Personel listesi ve bilgileri |
| `/admin` | Yetkili paneli: rol, departman ve personel yönetimi |
| `/profile` | Kullanıcının kendi profil bilgileri |

## Roller ve yetkiler

| Yetki | Admin | Takım Lideri | Personel |
| --- | :---: | :---: | :---: |
| Duyuru okuma | Evet | Evet | Evet |
| Duyuru oluşturma / düzenleme / silme | Evet | Evet | Hayır |
| Görev oluşturma / düzenleme / silme | Evet | Evet | Hayır |
| Kendi görev durumunu güncelleme | Evet | Evet | Evet |
| Arıza bildirimi açma | Evet | Evet | Evet |
| Arıza yönetimi (düzenleme / silme) | Evet | Evet | Hayır |
| Vardiya yönetimi | Evet | Hayır | Hayır |
| Personel ve departman yönetimi | Evet | Hayır | Hayır |
| Rol / departman düzenleme | Evet | Hayır | Hayır |

> Yetkiler Supabase Row Level Security (RLS) politikaları ile veritabanı seviyesinde uygulanır; ayrıntılar için `supabase/schema.sql` dosyasına bakın.

## Kurulum

1. Bağımlılıkları yükleyin.

```bash
npm install
```

2. `.env.example` dosyasını `.env.local` olarak kopyalayın ve Supabase bilgilerini girin.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Supabase SQL editöründe `supabase/schema.sql` dosyasını çalıştırın. Bu betik tablolar, enum tipleri, indeksler, tetikleyiciler ve RLS politikalarını oluşturur. `fault-photos` adındaki public Storage bucket'ı ve ilgili erişim politikaları otomatik olarak oluşturulur.

4. Geliştirme sunucusunu başlatın.

```bash
npm run dev
```

## Supabase notları

- `profiles.id`, Supabase Auth kullanıcı ID değeri (`auth.users.id`) ile aynıdır.
- Yeni bir kullanıcı Auth tarafında oluştuğunda `handle_new_user` tetikleyicisi devreye girer ve varsayılan olarak `staff` (Personel) rolüyle otomatik bir profil kaydı açar.
- Kullanıcının rolü ve departmanı Yetkili Paneli (`/admin`) üzerinden düzenlenir. Admin olmayan kullanıcılar `guard_profile_privileges` tetikleyicisi sayesinde kendi rollerini, departmanlarını veya aktifliklerini değiştiremez.
- Görev "Tamamlandı" ve arıza "Çözüldü" durumlarına geçtiğinde tamamlanma / çözülme zaman damgaları tetikleyicilerle otomatik yönetilir.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim derlemesi alır |
| `npm run start` | Üretim derlemesini çalıştırır |
| `npm run lint` | ESLint kontrollerini çalıştırır |
| `npm run typecheck` | TypeScript tür denetimi yapar (`tsc --noEmit`) |
| `npm run format` | Prettier ile kodu biçimlendirir |
| `npm run format:check` | Prettier biçim kontrolü yapar |

## Dağıtım

Proje Vercel üzerinde dağıtıma uygundur.

- Vercel proje ayarlarında aşağıdaki ortam değişkenlerini tanımlayın:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Sayfalar dinamik olduğundan build sırasında ek gizli anahtara gerek yoktur.

## Katkı

Geliştirme akışı, kod düzeni ve stil kuralları için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın. Ekip içi iş bölümü ve kontrol listesi için [COLLABORATION.md](COLLABORATION.md) dosyasını inceleyebilirsiniz.
