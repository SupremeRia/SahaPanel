# SahaPanel İşbirliği Rehberi

Bu dosya, projede birlikte çalışacak kişilerin aynı düzeni takip etmesi için hazırlandı.

## Proje hedefi

SahaPanel; petrol istasyonu, market, saha ekibi ve vardiyalı çalışan ekiplerde WhatsApp gruplarının yerine daha takip edilebilir bir iş akışı kurar. Duyuru, görev, arıza, vardiya ve personel süreçlerini tek panelde toplar.

## Modüller ve yeni özellikler

- **Duyurular:** Sabitleme (pinned) ve okundu takibi.
- **Görevler:** Öncelik (Düşük / Normal / Yüksek / Acil), durum yönetimi ve geciken görev takibi.
- **Arızalar:** Önem derecesi (Düşük / Orta / Yüksek / Kritik), fotoğraf yükleme ve büyütme (lightbox).
- **Vardiyalar:** Liste ve takvim görünümü.
- **Personel / Yetkili Paneli:** Rol ve departman yönetimi.
- **Genel iyileştirmeler:** Tüm modüllerde CRUD, arama/filtre, koyu tema, anlık bildirim (toast), CSV dışa aktarma ve PWA kurulumu.

## İş bölümü önerisi

| Alan | Sorumluluk |
| --- | --- |
| Supabase | Tablolar, RLS politikaları, Storage bucket, Auth kullanıcıları, tetikleyiciler |
| Frontend | Dashboard sayfaları, responsive menü, form ve liste ekranları, koyu tema |
| Operasyon | Duyuru okundu takibi, görev durumları, arıza süreci, vardiya görünümü |
| Test | Rol bazlı ekran kontrolü, mobil görünüm, CRUD ve filtre senaryoları |

## Kod düzeni

- `app/(dashboard)`: Panel sayfaları
- `app/actions.ts`: Veri yazma, güncelleme ve silme işlemleri (server actions)
- `components`: Ortak arayüz bileşenleri
- `lib`: Supabase istemcileri, rol yardımcıları ve biçimlendirme fonksiyonları
- `supabase/schema.sql`: Veritabanı şeması ve RLS politikaları

## Geliştirme akışı

1. Yeni işe başlamadan önce ilgili sayfayı ve `app/actions.ts` dosyasını kontrol edin.
2. Veritabanı değişikliği varsa önce `supabase/schema.sql` dosyasını güncelleyin.
3. UI değişikliği yaparken mobil görünümü ve koyu temayı da kontrol edin.
4. Rol bazlı davranışları en az Admin, Takım Lideri ve Personel ile test edin.
5. Pull request veya commit açıklamasında hangi modüllerin etkilendiğini yazın.

## Kontrol listesi

- [ ] Login Supabase Auth ile çalışıyor.
- [ ] Admin tüm ekranlara erişebiliyor.
- [ ] Takım Lideri duyuru, görev ve arıza yönetebiliyor.
- [ ] Personel duyuru okuyup arıza bildirimi açabiliyor.
- [ ] Duyuru okundu bilgisi kaydediliyor.
- [ ] Görev durumları ve öncelikleri güncelleniyor; geciken görevler işaretleniyor.
- [ ] Arıza fotoğraf yükleme ve büyütme (lightbox) test edildi.
- [ ] Arıza önem derecesi doğru gösteriliyor.
- [ ] Vardiya listesi ve takvim görünümü mobilde okunabilir.
- [ ] Kayıt oluşturma, düzenleme ve silme (CRUD) tüm modüllerde çalışıyor.
- [ ] Arama ve filtreler doğru sonuç veriyor.
- [ ] Koyu tema tüm ekranlarda okunabilir.
- [ ] CSV dışa aktarma beklenen veriyi üretiyor.
- [ ] PWA kurulumu mobil cihazda çalışıyor.
