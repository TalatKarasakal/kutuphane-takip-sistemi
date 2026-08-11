# Kütüphanem

Kütüphanem; kitap, film ve dizi koleksiyonlarını yerel olarak takip etmek için geliştirilmiş masaüstü odaklı bir koleksiyon yönetim uygulamasıdır. Uygulama Electron kabuğu içinde React arayüzü sunar, verileri tarayıcı tabanlı IndexedDB üzerinde saklar ve içe/dışa aktarma akışlarıyla koleksiyon verisini taşınabilir tutar.

## Teknoloji yığını

- Electron
- React 18
- TypeScript
- Vite
- TailwindCSS
- Dexie / IndexedDB
- Zustand
- xlsx
- PapaParse

## Özellikler

- Kitap koleksiyonu yönetimi
  - Kitap ekleme, düzenleme, silme ve toplu işlem desteği
  - Başlık, yazar, yayınevi, tür, durum, ISBN, sayfa sayısı, yayın yılı, dil, çevirmen ve not alanları
  - 1–5 yıldız puanı, ortak renkli etiketler, AND/OR filtreleme, etikete göre gruplama ve alan bazlı mükerrer birleştirme
  - Yalnız aktif kayıtları tutan ödünç verme/iade akışı

- Film ve dizi koleksiyonu yönetimi
  - Film/dizi ekleme, düzenleme, silme ve toplu durum güncelleme
  - Yönetmen, tür, çıkış yılı, izlenme yılı, süre, sezon, bölüm süresi, durum ve not alanları
  - Arama, filtreleme ve sıralama

- İçe ve dışa aktarma
  - Excel dosyaları için `xlsx`
  - CSV dosyaları için `papaparse`
  - Kitap ve medya kayıtları için ayrı dışa aktarma alanları
  - Ortak doğrulama, dosya/kayıt sınırları ve CSV formül hücresi koruması

- Yedekleme
  - Kitap, medya, etiket ve aktif ödünç kayıtlarını içeren şema v2
  - Son 20 yedeği tarih, boyut ve kayıt sayılarıyla görüntüleme
  - Önizleme ve zorunlu güvenlik yedeği sonrasında atomik geri yükleme

- İsteğe bağlı zengin görünüm
  - Klasik görünüm varsayılandır; Ayarlar'dan kapak/poster odaklı zengin görünüm açılabilir
  - Harici görseller varsayılan olarak kapalıdır ve açıldığında güvenli HTTPS katmanı ile yerel LRU önbelleğe alınır
  - ISBN elle girilebilir veya barkod görselinden okunabilir; çevrimiçi künye araması yalnız düğmeye basıldığında çalışır

- Fotoğraftan kitap ekleme
  - Kullanıcının kendi Google Gemini API anahtarıyla çalışır
  - Fotoğraftaki kitapları algılar ve bulunan kayıtları Google Books verisiyle zenginleştirmeye çalışır
  - Bu özellik Electron masaüstü uygulamasında kullanılabilir

- Yerel veri saklama
  - Kitap ve medya kayıtları Dexie üzerinden IndexedDB'de tutulur
  - Uygulama ayarları Zustand persist katmanıyla yerelde saklanır
  - Gemini anahtarı Electron `safeStorage` ile işletim sisteminin güvenli deposunda saklanır

## Kurulum

Projeyi klonladıktan sonra bağımlılıkları yükleyin:

```bash
npm install
```

## Geliştirme

Vite geliştirme sunucusunu başlatmak için:

```bash
npm run dev
```

Bu komut `package.json` içindeki `dev` scriptini çalıştırır ve Vite önizlemesini açar.

Tip kontrolü için:

```bash
npm run typecheck
```

Tüm kalite kapıları için:

```bash
npm run tracker:check
npm run lint
npm test
npm run build
npm run test:e2e
```

Üretim derlemesi için:

```bash
npm run build
```

Derlenmiş uygulamayı Vite ile önizlemek için:

```bash
npm run preview
```

## Masaüstü paketleme

macOS paketi üretmek için:

```bash
npm run pack:mac
```

Windows x64 NSIS kurucusu üretmek için:

```bash
npm run pack:win
```

Linux x64 AppImage ve deb üretmek için:

```bash
npm run pack:linux
```

Tüm platform hedeflerini sırasıyla üretmek için:

```bash
npm run pack:all
```

Paketleme çıktıları `release/` dizinine yazılır. macOS hedefi Universal DMG, Windows hedefi x64 NSIS, Linux hedefi x64 AppImage/deb üretir. İmza ve notarization hazırlığı için [paket imzalama belgesine](docs/signing.md) bakın.

## Gizlilik

Kütüphanem koleksiyon verilerini yerel IndexedDB veritabanında saklar; kitap, film ve dizi kayıtları bir Kütüphanem sunucusuna gönderilmez. Yedekler secret, ayar ve görsel Blob önbelleği içermez.

İsteğe bağlı ağ akışları yalnız kullanıcı eylemiyle çalışır:

- Fotoğraftan eklemede küçültülmüş görsel Gemini'ye; bulunan başlık/yazarlar künye zenginleştirmesi için Google Books'a gönderilir.
- ISBN aramasında yalnız girilen ISBN önce Google Books'a, sonuç yoksa OpenLibrary'ye gönderilir.
- Harici görseller ayarı açıldığında kullanıcının kayda eklediği HTTPS kapak/poster adresi güvenli ana süreç indiricisine gönderilir.
- “Güncelleme denetle” düğmesi GitHub Releases API'sine mevcut uygulama sürümünü açıklamadan istek yapar.

Yerel fontlar ağ isteği oluşturmaz. Çevrimdışı mod Gemini, ISBN, görsel ve güncelleme isteklerini kapatır. Gemini anahtarı kullanıcıya aittir; kaynak koda, localStorage'a veya yedeklere yazılmaz.

## Ekran görüntüleri

Yakında eklenecek.
