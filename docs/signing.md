# Paket imzalama

Yerel macOS paketleri sertifika yokken `afterPack` adımında ad-hoc imzalanır ve `codesign --verify --deep --strict` ile doğrulanabilir. Genel dağıtım için Apple Developer ID Application sertifikası, notarization hesabı ve Windows Authenticode sertifikası gerekir.

CI ortamında electron-builder'ın standart değişkenleri kullanılır:

- macOS: `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`
- Windows: `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD`

macOS paketleme adımı sertifika bulunduğunda kimliği otomatik keşfeder. Ardından `xcrun notarytool` ile DMG'yi Apple'a gönderir, sonucu bekler ve bileti `xcrun stapler` ile pakete iliştirip doğrular. Secret bulunmadığında bu adım paketi yanlışlıkla yayınlamaz; dış doğrulama takipçide açık kalır.

Bu secret'lar repoya veya yedek dosyalarına yazılmaz. Sertifikalar sağlanana kadar notarization ve gerçek Windows imza doğrulaması proje takipçisinde dış bağımlılık olarak kalır.
