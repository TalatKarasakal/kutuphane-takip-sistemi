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
  - Arama, durum/tür filtresi, sıralama ve yinelenen kayıtları gösterme

- Film ve dizi koleksiyonu yönetimi
  - Film/dizi ekleme, düzenleme, silme ve toplu durum güncelleme
  - Yönetmen, tür, çıkış yılı, izlenme yılı, süre, sezon, bölüm süresi, durum ve not alanları
  - Arama, filtreleme ve sıralama

- İçe ve dışa aktarma
  - Excel dosyaları için `xlsx`
  - CSV dosyaları için `papaparse`
  - Kitap ve medya kayıtları için ayrı dışa aktarma alanları

- Fotoğraftan kitap ekleme
  - Kullanıcının kendi Google Gemini API anahtarıyla çalışır
  - Fotoğraftaki kitapları algılar ve bulunan kayıtları Google Books verisiyle zenginleştirmeye çalışır
  - Bu özellik Electron masaüstü uygulamasında kullanılabilir

- Yerel veri saklama
  - Kitap ve medya kayıtları Dexie üzerinden IndexedDB'de tutulur
  - Uygulama ayarları Zustand persist katmanıyla yerelde saklanır

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

Windows portable paket üretmek için:

```bash
npm run pack:win
```

macOS ve Windows paketlerini birlikte üretmek için:

```bash
npm run pack:all
```

Paketleme çıktıları `release/` dizinine yazılır. macOS paketleme scripti önce üretim derlemesini alır, ardından `scripts/build-mac.mjs` ile ARM64 DMG üretir. Windows paketleme scripti üretim derlemesinden sonra `electron-builder --win --publish never` komutunu çalıştırır.

## Gizlilik

Kütüphanem koleksiyon verilerini yerel IndexedDB veritabanında saklar; kitap, film ve dizi kayıtları harici bir uygulama sunucusuna gönderilmez.

Fotoğraftan kitap ekleme özelliği için Google Gemini API anahtarı kullanıcı tarafından sağlanır. Bu anahtar kullanıcıya aittir, kaynak koda eklenmez ve repoya commit edilmemelidir.

## Ekran görüntüleri

Yakında eklenecek.
