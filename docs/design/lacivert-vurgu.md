# Kütüphanem — aydınlık temada vurgu lacivert olsun

Turkuaz kararından vazgeçildi. Aydınlık temada vurgu rengi **lacivert**
olacak — sol üstteki uygulama simgesinin zemininde kullanılan ton.

## Token değişikliği

Bir önceki turda verilen `--accent-mark` token'ını kaldır; iki tona ayırmaya
gerek yok, lacivert zaten beyaz metinle yüksek kontrast veriyor.

```css
:root[data-theme="light"] {
  --accent: #1e3a6e; /* birincil vurgu — beyaz metinle 9,8:1 */
  --accent-hot: #162c55; /* hover / basılı */
  --accent-soft: rgba(30, 58, 110, 0.12);

  --warn: #8e2433; /* bordo yalnızca "Satın Alınacak" durumunda */
}
```

Karanlık temaya dokunma; orada vurgu bordo kalıyor.

## Nerede kullanılacak

Bir önceki turda turkuaz için sayılan yerlerin **hepsi** artık `--accent`
kullanacak — ikili ton ayrımı yok:

- "Kitap Ekle" butonu ve açılır oku
- Modal onay butonu
- Kenar çubuğundaki "DURUM" ve "TÜR" başlıklarının solundaki dikey çubuk
- Aktif filtrenin sol çubuğu ve zemini (`--accent-soft`)
- Tablo satırlarının solundaki dikey çubuk
- Seçili satırın sol çubuğu
- Seçim kutusunun işaretli dolgusu
- Aktif sıralama oku
- Üst bardaki aktif görünüm düğmesi
- Odak halkaları

## Çakışma kontrolü

Lacivert vurgu ile "Okunacak" durum rengi (`--glow` `#2A5A9E`) aynı aileden
geliyor ve karışabilir. Ayrımı koru:

- **Vurgu** `#1E3A6E` — koyu, dolgulu yüzeylerde
- **Okunacak** `#2A5A9E` — daha açık, yalnızca durum rozetinde

Rozet dolgulu değil, açık zeminli ve kenarlıklı kalırsa ayrım daha net olur:
`background: rgba(42, 90, 158, 0.10); border: 1px solid rgba(42, 90, 158, 0.35);
color: #2A5A9E`.

"Okundu" yeşili (`#2F7D32`) artık turkuazla çakışmıyor, olduğu gibi kalabilir.

## Uygulama simgesi

Sol üstteki simge kutusu aydınlık temada zaten lacivert; artık vurgu rengiyle
aynı aileden olduğu için `--accent` üzerinden beslensin — tutarlılık için.
Karanlık temada bordo kalmaya devam ediyor.
