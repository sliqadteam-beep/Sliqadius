package com.qevyno.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Base64;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class MainActivity extends Activity {

    private WebView webView;
    private String pendingAddPhone = "";

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        pendingAddPhone = extractAddPhone(getIntent());

        getWindow().setStatusBarColor(Color.rgb(255, 255, 255));
        getWindow().setNavigationBarColor(Color.rgb(255, 255, 255));
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        );

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(247, 250, 252));
        webView.setVisibility(View.INVISIBLE);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowContentAccess(false);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.addJavascriptInterface(new DeviceInfoBridge(), "QevynoDevice");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                StringBuilder bundle = new StringBuilder();
                appendAsset(bundle, "auth23.js");
                appendAsset(bundle, "ui26.js");
                appendAsset(bundle, "ui27.js");
                appendAsset(bundle, "ui28.js");
                appendAsset(bundle, "startup292.js");
                appendAsset(bundle, "qr293.js");

                runScript(view, bundle.toString(), () -> view.setVisibility(View.VISIBLE));
            }
        });

        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String phone = extractAddPhone(intent);
        if (phone.isEmpty()) return;
        pendingAddPhone = phone;
        if (webView != null) {
            String js = "window.qevynoConsumeNativeAdd&&window.qevynoConsumeNativeAdd(" + JSONObject.quote(phone) + ");";
            webView.evaluateJavascript(js, null);
        }
    }

    private String extractAddPhone(Intent intent) {
        try {
            if (intent == null) return "";
            Uri data = intent.getData();
            if (data == null) return "";
            String phone = data.getQueryParameter("phone");
            if (phone == null) return "";
            phone = phone.trim();
            return phone.matches("^\\+[1-9]\\d{7,14}$") ? phone : "";
        } catch (Exception ignored) {
            return "";
        }
    }

    private void appendAsset(StringBuilder bundle, String name) {
        String script = readAsset(name);
        if (script != null && !script.isEmpty()) {
            bundle.append('\n').append(script).append('\n');
        }
    }

    private void runScript(WebView view, String script, Runnable done) {
        if (script == null || script.isEmpty()) {
            done.run();
            return;
        }
        view.evaluateJavascript(script, ignored -> done.run());
    }

    private String readAsset(String name) {
        try (InputStream in = getAssets().open(name)) {
            byte[] data = new byte[in.available()];
            int read = in.read(data);
            if (read > 0) {
                return new String(data, 0, read, StandardCharsets.UTF_8);
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private class DeviceInfoBridge {
        @JavascriptInterface
        public String getCountryIso() {
            try {
                TelephonyManager tm = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
                if (tm != null) {
                    String network = tm.getNetworkCountryIso();
                    if (network != null && network.length() == 2) {
                        return network.toUpperCase(Locale.US);
                    }
                    String sim = tm.getSimCountryIso();
                    if (sim != null && sim.length() == 2) {
                        return sim.toUpperCase(Locale.US);
                    }
                }
            } catch (Exception ignored) {
            }

            String localeCountry = Locale.getDefault().getCountry();
            if (localeCountry != null && localeCountry.length() == 2) {
                return localeCountry.toUpperCase(Locale.US);
            }
            return "DE";
        }

        @JavascriptInterface
        public String makeQr(String text) {
            if (text == null || text.isEmpty()) return "";
            try {
                final int size = 520;
                BitMatrix matrix = new MultiFormatWriter().encode(text, BarcodeFormat.QR_CODE, size, size);
                Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
                int dark = Color.rgb(23, 33, 43);
                int light = Color.WHITE;
                for (int y = 0; y < size; y++) {
                    for (int x = 0; x < size; x++) {
                        bitmap.setPixel(x, y, matrix.get(x, y) ? dark : light);
                    }
                }
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
                String encoded = Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP);
                return "data:image/png;base64," + encoded;
            } catch (Exception ignored) {
                return "";
            }
        }

        @JavascriptInterface
        public String consumePendingAddPhone() {
            String phone = pendingAddPhone;
            pendingAddPhone = "";
            return phone == null ? "" : phone;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
