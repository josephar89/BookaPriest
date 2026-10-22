BOOK A PRIEST — APP ICON PACK
Design: navy #131E3C background, solid yellow #FCD116 pin with priest (v4 logo).
One master design, exported per platform. Do NOT redraw per platform.

ANDROID (primary — 75% of users)
- play-store-512.png        : Play Console listing icon (512x512).
- adaptive-background-432.png + adaptive-foreground-432.png :
  Use as the adaptive icon layers (background = solid navy layer,
  foreground = pin, already centred inside the safe zone so Samsung
  (squircle), Pixel (circle) and Xiaomi masks never clip the pin tip).
  In Android Studio: File > New > Image Asset > Launcher Icons,
  foreground = adaptive-foreground, background type = image/color #131E3C.
  Scale the foreground down per density, or supply the vector.
- ic_launcher-<density>.png : legacy square icons for pre-Android-8 devices.
- themed-monochrome-foreground-432.png : Android 13+ themed icon layer
  (single-colour silhouette; pair with the same navy background).

iOS (~23% of users)
- ios/AppIcon-*.png : drag into the Xcode asset catalog (AppIcon set).
  1024 = App Store. Icons are full square with NO transparency —
  iOS applies the rounded mask itself. Do not pre-round the corners.

WEBSITE (~2% of users)
- web/favicon.ico + favicon-16/32/48.png : browser tab icon.
- web/apple-touch-icon-180.png : iPhone home-screen bookmark.
- web/icon-192.png / icon-512.png / maskable-512.png : PWA manifest icons
  (maskable has extra padding so Android's mask can't clip the pin).
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
  <link rel="manifest" href="/manifest.webmanifest">

NOTE ON TINY SIZES: at 16-32px the priest's details merge — the pin
silhouette + yellow/navy contrast is what carries recognition there.
That's expected; favicons are recognised by shape and colour, not detail.
