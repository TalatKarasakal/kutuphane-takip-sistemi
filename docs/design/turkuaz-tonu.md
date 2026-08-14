# Kütüphanem — turkuaz tonu ve satır hover eylemi

## 1. Aydınlık temada turkuaz tonunu netleştir

Mevcut `#0E6E66` yeşile kaçıyor. Daha saf bir turkuaz istiyoruz ama beyaz
metin okunaklılığını kaybetmeden. Bu yüzden vurgu **iki tona ayrılıyor**:

```css
:root[data-theme="light"] {
  --accent: #0f7e74; /* beyaz metin taşıyan yüzeyler — 4,94:1 */
  --accent-hot: #0b6a61; /* hover / basılı */
  --accent-mark: #16a398; /* metin taşımayan işaretler — saf turkuaz */
  --accent-soft: rgba(22, 163, 152, 0.14);
}
```

**`--accent` nerede kullanılır** (üzerinde beyaz metin var, koyu kalmalı):

- "Kitap Ekle" butonu ve açılır oku
- Modal içindeki onay butonu ("12 Kitabı Ekle")
- Dolgulu durum rozetleri

**`--accent-mark` nerede kullanılır** (metin yok, parlak olabilir):

- Kenar çubuğundaki "DURUM" ve "TÜR" başlıklarının solundaki dikey çubuk
- Aktif filtrenin sol çubuğu
- Tablo satırlarının solundaki dikey çubuk
- Seçili satırın sol çubuğu
- Seçim kutusunun işaretli dolgusu (beyaz tik üzerinde 3,1:1 — grafik öğe
  için yeterli)
- Aktif sıralama oku
- Üst bardaki aktif görünüm düğmesinin simgesi
- Odak halkası

Karanlık temaya dokunma.

> Not: `#16A398` üzerinde beyaz metin 3,1:1 veriyor; bu bir grafik öğe için
> yeterli ama okunacak metin için değil. Bu yüzden butonlar `--accent`'te
> kalıyor. Daha parlak bir turkuazı butona taşımak metni okunmaz yapar.

## 2. Satır hover'ındaki hızlı eylem düğmesini kaldır

Tablo satırının üzerine gelindiğinde sağ uçta beliren "→ Okundu" / "→ Okunacak"
düğmesi ekrana sığmıyor ve kırpılıyor. Bu özelliği tamamen kaldır:

- Satır hover'ında beliren hızlı durum değiştirme düğmesini render etme
- İlgili hover durumu, CSS kuralları ve tıklama işleyicisini de temizle
- Satır hover'ı yalnızca zemin renginin değişmesi olarak kalsın
  (`--bg-hover`)

Durum değiştirme, satıra tıklayınca açılan detay görünümünden veya mevcut
durum rozetinden yapılmaya devam edecek.
