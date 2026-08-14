# Kütüphanem — tema bazlı vurgu rengi

Tek bir değişiklik: **vurgu rengi temaya göre değişecek.**

- **Karanlık tema:** bordo öne çıkar (mevcut hali korunur, bir ekleme var).
- **Aydınlık tema:** turkuaz öne çıkar, bordo eylem rengi olmaktan çıkar.

Bu, `--accent` token'ının iki temada farklı aileden gelmesi demek. Token
adlarını değiştirme, yalnızca değerlerini ve birkaç bağlı kuralı güncelle.

---

## 1. Aydınlık tema token'ları

```css
:root[data-theme="light"] {
  /* Vurgu artık turkuaz */
  --accent: #0e6e66; /* birincil eylem, aktif filtre, seçili satır */
  --accent-hot: #0a5751; /* hover / basılı durum */
  --accent-soft: rgba(14, 110, 102, 0.12);

  /* Bordo kalıyor ama rolü değişti: yalnızca durum rengi */
  --warn: #8e2433;

  /* Diğerleri aynı */
  --navy: #2b3b5e;
  --glow: #2a5a9e;
}
```

Beyaz metin `#0E6E66` üzerinde 5,6:1 kontrast veriyor, WCAG AA geçiyor.
Daha açık bir turkuaz (`#12887E` ve üstü) kullanma — beyaz metinle sınırda
kalıyor.

## 2. Karanlık tema token'ları

Mevcut değerler korunuyor, tek ekleme `--warn`:

```css
:root[data-theme="dark"] {
  --accent: #b23a4b;
  --accent-hot: #c8323c;
  --accent-soft: rgba(178, 58, 75, 0.16);
  --warn: #b23a4b; /* karanlık temada uyarı da bordo */
}
```

---

## 3. Aydınlık temada bordoya dokunan her yeri turkuaza çevir

Ekran görüntülerinde bordo görünen ve **aydınlık temada** değişmesi gereken
öğeler:

- "Kitap Ekle" butonu ve yanındaki açılır ok
- Modal içindeki "12 Kitabı Ekle" butonu
- Modal kapatma (×) butonunun kenarlığı
- Satır seçim kutuları (işaretliyken dolgu)
- Kenar çubuğundaki "DURUM" ve "TÜR" başlıklarının solundaki dikey çubuk
- Aktif filtre satırının sol çubuğu ve zemini
- Seçili tablo satırının sol çubuğu
- Odak halkaları
- Aktif sıralama okunun rengi
- Üst bardaki aktif görünüm düğmesi (tablo/kart geçişi)

Bunların hepsi `--accent` üzerinden geldiği için token değişikliği yeterli
olmalı. Kodda doğrudan bordo hex değeri kalmış bir yer varsa onları da
`--accent`'e bağla.

---

## 4. Durum renkleri — çakışmayı önle

Aydınlık temada vurgu turkuaz olunca "Okundu" için kullanılan yeşil ona çok
yaklaşıyor. Durum renklerini şu şekilde ayır:

### Aydınlık tema

| Durum          | Renk                    | Biçim                       |
| -------------- | ----------------------- | --------------------------- |
| Okundu         | `#2F7D32` (düz yeşil)   | dolgulu, açık               |
| Okunacak       | `var(--glow)` `#2A5A9E` | dolgulu, açık               |
| Elimde Mevcut  | `var(--text-mute)`      | yalnızca kenarlık, dolgusuz |
| Satın Alınacak | `var(--warn)` `#8E2433` | yalnızca kenarlık           |

### Karanlık tema

| Durum          | Renk                    | Biçim                                                           |
| -------------- | ----------------------- | --------------------------------------------------------------- |
| Okundu         | `#3DAE7A`               | dolgulu, koyu                                                   |
| Okunacak       | `var(--glow)` `#3E72B8` | dolgulu, koyu                                                   |
| Elimde Mevcut  | `var(--text-mute)`      | yalnızca kenarlık                                               |
| Satın Alınacak | `var(--warn)` `#B23A4B` | **yalnızca kenarlık** — dolgulu olursa birincil butonla yarışır |

---

## 5. Sol üstteki uygulama simgesi

- **Karanlık tema:** simge kutusunun zemini `var(--accent-soft)`, kenarlığı
  `1px solid rgba(178, 58, 75, 0.35)`, kitap ikonu `var(--accent)`.
- **Aydınlık tema:** olduğu gibi kalsın — lacivert zemin, beyaz ikon.
  Değiştirme.

---

## 6. Kontrol listesi

- [ ] Aydınlık temada hiçbir buton, kenarlık veya seçim kutusu bordo değil
- [ ] Aydınlık temada bordo yalnızca "Satın Alınacak" durumunda görünüyor
- [ ] Karanlık temada bordo eylem rengi olarak duruyor
- [ ] Karanlık temada sol üstteki simge bordo tonunda
- [ ] Aydınlık temada simge değişmedi
- [ ] "Okundu" yeşili ile turkuaz vurgu birbirinden ayırt edilebiliyor
- [ ] Beyaz metin turkuaz buton üzerinde okunaklı (≥ 4,5:1)
