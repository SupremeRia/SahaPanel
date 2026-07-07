# Katkı Rehberi

Bu rehber, SahaPanel projesine katkıda bulunacak geliştiriciler için ortak bir çalışma düzeni sunar. Amacımız tutarlı, okunabilir ve rol bazlı erişim kurallarına saygılı bir kod tabanı korumaktır.

## Geliştirme akışı

1. Depoyu klonlayın ve bağımlılıkları yükleyin (`npm install`).
2. `.env.example` dosyasını `.env.local` olarak kopyalayıp Supabase bilgilerini girin.
3. Yeni bir dal (branch) açın; dal adında etkilenen modülü belirtmeye çalışın (örn. `feature/tasks-filter`).
4. Değişikliğinizi yapmadan önce ilgili sayfayı ve `app/actions.ts` dosyasını inceleyin.
5. Veritabanı değişikliği gerekiyorsa önce `supabase/schema.sql` dosyasını güncelleyin.
6. Göndermeden önce test kontrol listesini uygulayın.
7. `npm run lint`, `npm run typecheck` ve `npm run format:check` komutlarının temiz geçtiğinden emin olun.
8. Pull request açın ve hangi modüllerin etkilendiğini açıklayın.

## Kod düzeni

- `app/(dashboard)`: Panel sayfaları (dashboard, announcements, tasks, faults, shifts, personnel, admin, profile).
- `app/actions.ts`: Sunucu tarafı işlemler (server actions); veri yazma, güncelleme ve silme burada yapılır.
- `components`: Ortak arayüz bileşenleri (form, liste, tablo, toast, modal vb.).
- `lib`: Yardımcı fonksiyonlar; Supabase istemcileri, rol yardımcıları ve biçimlendirme fonksiyonları.
- `supabase/schema.sql`: Veritabanı şeması, enum tipleri, tetikleyiciler ve RLS politikaları.

## Stil kuralları

- **Tailwind:** Sabit renk kodları yerine anlamsal token'ları kullanın (örn. `bg-background`, `text-foreground`, `border-border`). Bu, koyu tema uyumunu korur.
- **Türkçe metin:** Kullanıcıya gösterilen tüm metinler Türkçe ve doğru diakritiklerle yazılır (ç, ğ, ı, İ, ö, ş, ü).
- **İkonlar:** Görsel öğeler için `lucide-react` ikonlarını kullanın; tutarlı boyut ve stil koruyun.
- **Sunucu / istemci ayrımı:** Bileşenleri varsayılan olarak sunucu bileşeni tutun; yalnızca etkileşim (state, event, tarayıcı API'leri) gerektiğinde `"use client"` ekleyin. Veri yazma işlemlerini server action'lar üzerinden yürütün.
- **Biçimlendirme:** Kod, projedeki `.prettierrc.json` ayarlarıyla biçimlendirilir. Göndermeden önce `npm run format` çalıştırın.

## Commit ve PR önerileri

- Commit mesajlarını kısa, açıklayıcı ve tercihen Türkçe yazın; etkilenen modülü belirtin (örn. `görevler: öncelik filtresi eklendi`).
- Her PR tek bir konuya odaklansın; büyük değişiklikleri mantıklı parçalara bölün.
- PR açıklamasında: ne değişti, hangi modüller etkilendi ve nasıl test edildi bilgilerini ekleyin.
- UI değişikliklerinde açık ve koyu temada ekran görüntüsü paylaşmak faydalıdır.

## Test kontrol listesi

Değişikliği göndermeden önce en az aşağıdaki rollerle deneyin:

**Admin**

- [ ] Tüm ekranlara erişebiliyor.
- [ ] Personel, departman ve vardiya yönetimi çalışıyor.
- [ ] Rol / departman düzenleme kaydediliyor.

**Takım Lideri**

- [ ] Duyuru, görev ve arıza oluşturma / düzenleme / silme çalışıyor.
- [ ] Vardiya ve personel yönetim ekranlarına erişimi kısıtlı.

**Personel**

- [ ] Duyuruları okuyup okundu bilgisi kaydedebiliyor.
- [ ] Kendi görev durumunu güncelleyebiliyor.
- [ ] Arıza bildirimi açıp fotoğraf yükleyebiliyor.
- [ ] Yetkisiz düzenleme / silme işlemlerini yapamıyor.

**Genel**

- [ ] Arama ve filtreler doğru sonuç veriyor.
- [ ] Koyu tema tüm ekranlarda okunabilir.
- [ ] CSV dışa aktarma beklenen veriyi üretiyor.
- [ ] PWA kurulumu mobil cihazda çalışıyor.
- [ ] Mobil görünüm bozulmuyor.
- [ ] `npm run lint`, `npm run typecheck` ve `npm run build` başarılı.
