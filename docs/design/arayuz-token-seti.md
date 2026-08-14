# Kütüphanem — arayüz renk ve düzen revizyonu

Bu uygulamanın arayüzünü aşağıdaki token setine göre yeniden kur. Renkleri
kendin türetme, yorumlama veya "yakın ton" seçme — buradaki hex değerleri
birebir kullan.

Palet, `talatkarasakal.com` sitesinde kullanılan palet ailesinden türetilmiştir
ama **yoğun bir masaüstü aracı için genişletilmiştir**: portfolyo sayfası üç
yüzey kademesiyle idare ederken bu uygulama beş kademeye ihtiyaç duyuyor
(pencere zemini, kenar çubuğu, üst bar, içerik paneli, satır).

---

## 1. Token seti

Tüm renkleri CSS özel değişkeni olarak tanımla ve arayüzde **hiçbir yerde
doğrudan hex yazma**. Mevcut kodda gömülü hex değerleri varsa hepsini bu
token'lara çevir.

### Karanlık tema

```css
:root[data-theme="dark"] {
  /* Yüzey kademeleri — en koyudan en açığa */
  --bg-app: #070b14; /* pencere zemini, en dış katman */
  --bg-sidebar: #0b1220; /* sol kenar çubuğu */
  --bg-topbar: #0e1626; /* üst bar — kenar çubuğundan AÇIK olacak */
  --bg-panel: #111a2c; /* içerik paneli, tablo kabı */
  --bg-row: #131e33; /* tablo satırı / kart yüzeyi */
  --bg-row-alt: #0f1728; /* zebra: tek satırlar */
  --bg-hover: #1a2740; /* satır hover */
  --bg-active: #1e2e4a; /* seçili satır */

  /* Metin */
  --text: #e9eef7;
  --text-dim: rgba(233, 238, 247, 0.68);
  --text-mute: rgba(233, 238, 247, 0.54);

  /* Çizgiler */
  --line: rgba(214, 224, 240, 0.1);
  --line-strong: rgba(214, 224, 240, 0.2);

  /* Vurgular */
  --accent: #b23a4b; /* BORDO — birincil vurgu */
  --accent-hot: #c8323c; /* bordo, yalnızca hover/aktif */
  --accent-soft: rgba(178, 58, 75, 0.16); /* bordo dolgu */
  --navy: #12243f; /* ikincil dolgu */
  --glow: #3e72b8; /* çelik mavisi — bilgi/bağlantı */
  --success: #3dae7a;
}
```

### Aydınlık tema

```css
:root[data-theme="light"] {
  /* Yüzey kademeleri — ÖNEMLİ: kağıt SICAK, mürekkep SOĞUK.
     Mevcut arayüzdeki soğuk mavi-gri kağıt kaldırılacak. */
  --bg-app: #e7e2d8; /* pencere zemini, en koyu kağıt */
  --bg-sidebar: #ede9e1;
  --bg-topbar: #f2efe8;
  --bg-panel: #f8f6f1;
  --bg-row: #fdfcf9;
  --bg-row-alt: #f5f2ec;
  --bg-hover: #efeae0;
  --bg-active: #f4ede9; /* bordoya çekilmiş kağıt */

  --text: #14203a; /* lacivert mürekkep */
  --text-dim: rgba(20, 32, 58, 0.8);
  --text-mute: rgba(20, 32, 58, 0.62);

  --line: rgba(20, 32, 58, 0.16);
  --line-strong: rgba(20, 32, 58, 0.3);

  --accent: #8e2433;
  --accent-hot: #a3202c;
  --accent-soft: rgba(142, 36, 51, 0.12);
  --navy: #2b3b5e;
  --glow: #2a5a9e;
  --success: #1e7f52;

  /* Aydınlık temada derinlik gölgeyle kurulur, parlamayla değil */
  --elev-1: 0 1px 2px rgba(20, 32, 58, 0.07), 0 2px 8px rgba(20, 32, 58, 0.06);
  --elev-2: 0 2px 4px rgba(20, 32, 58, 0.08), 0 12px 28px rgba(20, 32, 58, 0.1);
}
```

**Kural:** aydınlık temada hiçbir yerde `mix-blend-mode` kullanma ve vurgu
renginde gölge (`box-shadow`) verme. Karanlık temada `--elev-*` kullanma,
derinliği kenarlık ve yüzey farkıyla kur.

---

## 2. Yüzey hiyerarşisi — sorun: üst bar ile kenar çubuğu aynı renk

Şu an üst bar ve sol kenar çubuğu aynı zemini paylaşıyor, aralarında sınır
yok. Aşağıdaki eşlemeyi uygula:

| Bölge            | Token                       | Ek kural                        |
| ---------------- | --------------------------- | ------------------------------- |
| Pencere gövdesi  | `--bg-app`                  |                                 |
| Sol kenar çubuğu | `--bg-sidebar`              | sağında `1px solid var(--line)` |
| Üst bar          | `--bg-topbar`               | altında `1px solid var(--line)` |
| İçerik paneli    | `--bg-panel`                |                                 |
| Tablo satırı     | `--bg-row` / `--bg-row-alt` |                                 |

Aydınlık temada bu kademeler arasındaki fark gözle seçilebilir olmalı. Mevcut
haldeki gibi panel ile zemin neredeyse aynı olmamalı — yukarıdaki değerler
arasında en az iki kademe fark var, onları koru.

---

## 3. Bordo oranını artır — sorun: kırmızı çok az

Şu an arayüzde vurgu rengi neredeyse yok; birincil buton turkuaz, etiketler
mavi. Bordo şu yerlere gelecek:

- **Birincil eylem butonu** ("Kitap Ekle"): dolgu `--accent`, hover
  `--accent-hot`, metin beyaz. Turkuaz artık birincil eylem rengi DEĞİL.
- **Aktif filtre**: seçili filtre satırının solunda `3px solid var(--accent)`
  dikey çubuk, zemini `--accent-soft`, metni `--text`.
- **Bölüm başlıkları** ("DURUM", "TÜR"): başlığın solundaki ince çubuk
  `--accent`.
- **Seçili tablo satırı**: solunda `3px solid var(--accent)`, zemini
  `--bg-active`.
- **Odak halkası**: `outline: 2px solid var(--accent); outline-offset: 2px`.
- **Sıralama göstergesi**: aktif sütunun ok simgesi `--accent`.

Turkuaz (`--success`) yalnızca **durum göstergesi** olarak kalır: "Okundu"
noktası, başarı bildirimi. Eylem rengi olarak kullanılmaz.

---

## 4. Etiket renkleri — sorun: mavi tonlar palet dışı

Tür etiketleri (Roman, Tarih, Oyun) şu an palet dışı canlı mavi kullanıyor.
Etiketler renkle ayrışmasın; hepsi aynı nötr görünümde olsun:

```css
.tag {
  background: var(--accent-soft);
  border: 1px solid var(--line-strong);
  color: var(--text-dim);
}
```

Türe göre farklı renk atama. On bir tür var; on bir renk arayüzü kirletir ve
hiçbiri anlam taşımaz. Ayrım tür adının kendisiyle zaten kuruluyor.

Durum etiketleri (`Elimde Mevcut`, `Okunacak`) farklı: onlar durum taşıdığı
için renk ayrımı meşru.

- `Okundu` → `--success`
- `Okunacak` → `--glow`
- `Elimde Mevcut` → `--text-mute`, dolgusuz, yalnızca kenarlıklı
- `Satın Alınacak` → `--accent`

---

## 5. Tablo görünümü — sorun: satırlar üst üste

- Satır yüksekliği en az **52px**, dikey iç boşluk `14px`.
- Satırlar arasında `1px solid var(--line)` ayırıcı.
- Zebra: çift satırlar `--bg-row`, tek satırlar `--bg-row-alt`.
- Hover `--bg-hover`, geçiş `140ms`.
- Başlık satırı yapışkan (`position: sticky; top: 0`), zemini `--bg-panel`,
  altında `1px solid var(--line-strong)`.
- Yayınevi sütunu iki satıra sarıyor ve satırı şişiriyor: `white-space: nowrap;
overflow: hidden; text-overflow: ellipsis` uygula, tam adı `title`
  özniteliğinde ver.
- Sütun genişlikleri sabitlensin: Başlık `2fr`, Yazar `1.4fr`, Yayınevi
  `1.4fr`, Tür `auto`, Sayfa `auto`, Durum `auto`.

---

## 6. Seçim kutusu — sorun: arayüzle bütünleşik değil

Yerleşik `<input type="checkbox">` görünümünü tamamen değiştir:

```css
.row-check {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--line-strong);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  transition:
    border-color 140ms,
    background 140ms;
}
.row-check:hover {
  border-color: var(--accent);
}
.row-check:checked {
  background: var(--accent);
  border-color: var(--accent);
}
.row-check:checked::after {
  content: "";
  display: block;
  width: 4px;
  height: 8px;
  margin: 1px auto 0;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.row-check:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

## 7. Kenar çubuğu filtreleri — sorun: karanlık modda zeminle aynı renk

Filtre listesi kutuları kenar çubuğuyla aynı zeminde duruyor, sınırları
görünmüyor. Her filtre grubu kendi kabında olsun:

```css
.filter-group {
  background: var(--bg-panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 6px;
}
.filter-item {
  padding: 8px 10px;
  border-radius: 4px;
  color: var(--text-dim);
  transition:
    background 140ms,
    color 140ms;
}
.filter-item:hover {
  background: var(--bg-hover);
  color: var(--text);
}
.filter-item.is-active {
  background: var(--accent-soft);
  color: var(--text);
  border-left: 3px solid var(--accent);
  padding-left: 7px;
}
.filter-count {
  color: var(--text-mute);
  font-variant-numeric: tabular-nums;
}
```

Sayı sütunu sağa hizalı ve tablo rakamlı olsun ki alt alta hizalansın.

---

## 8. Kontrol listesi

Bitirdiğinde şunları doğrula:

- [ ] Kodda token dışında hiçbir hex değeri kalmadı
- [ ] Üst bar, kenar çubuğu ve içerik paneli üç ayrı yüzey olarak seçiliyor
- [ ] Aydınlık temada kağıt sıcak (`#E7E2D8` ailesi), soğuk gri kalmadı
- [ ] Aydınlık temada hiçbir yerde `mix-blend-mode` yok
- [ ] Birincil buton bordo, turkuaz yalnızca durum göstergesinde
- [ ] Tür etiketleri tek renk, durum etiketleri anlamlı renkte
- [ ] Tablo satır yüksekliği ≥ 52px, zebra ve ayırıcı çizgi var
- [ ] Seçim kutusu özel biçimlendirilmiş, işaretliyken bordo
- [ ] Kenar çubuğundaki filtre grupları kendi kaplarında ve sınırları görünüyor
- [ ] Her iki temada da metin kontrastı WCAG AA (4.5:1) üzerinde
