package com.qevyno.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
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
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;

public class MainActivity extends Activity {

    private static final int REQUEST_PROFILE_PICTURE = 5201;
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
                appendAsset(bundle, "i18n294.js");
                appendAsset(bundle, "features295.js");
                appendAsset(bundle, "features296.js");
                appendAsset(bundle, "features297.js");
                appendAsset(bundle, "features298.js");
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

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_PROFILE_PICTURE || resultCode != RESULT_OK || data == null || data.getData() == null) return;
        Uri uri = data.getData();
        try {
            BitmapFactory.Options bounds = new BitmapFactory.Options();
            bounds.inJustDecodeBounds = true;
            try (InputStream in = getContentResolver().openInputStream(uri)) {
                BitmapFactory.decodeStream(in, null, bounds);
            }
            if (bounds.outWidth < 1 || bounds.outHeight < 1) throw new IllegalArgumentException("bad image");

            int sample = 1;
            while (bounds.outWidth / sample > 3200 || bounds.outHeight / sample > 3200) sample *= 2;
            BitmapFactory.Options opts = new BitmapFactory.Options();
            opts.inSampleSize = sample;
            Bitmap bitmap;
            try (InputStream in = getContentResolver().openInputStream(uri)) {
                bitmap = BitmapFactory.decodeStream(in, null, opts);
            }
            if (bitmap == null) throw new IllegalArgumentException("bad image");

            int w = bitmap.getWidth(), h = bitmap.getHeight();
            double scale = Math.min(1.0, 1600.0 / Math.max(w, h));
            if (scale < 1.0) {
                int nw = Math.max(1, (int)Math.round(w * scale));
                int nh = Math.max(1, (int)Math.round(h * scale));
                Bitmap resized = Bitmap.createScaledBitmap(bitmap, nw, nh, true);
                if (resized != bitmap) bitmap.recycle();
                bitmap = resized; w = nw; h = nh;
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.JPEG, 88, out);
            bitmap.recycle();
            String dataUrl = "data:image/jpeg;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP);
            String js = "window.qevynoProfilePicked&&window.qevynoProfilePicked(" + JSONObject.quote(dataUrl) + "," + w + "," + h + ");";
            webView.evaluateJavascript(js, null);
        } catch (Exception e) {
            if (webView != null) webView.evaluateJavascript("window.qevynoProfilePickFailed&&window.qevynoProfilePickFailed();", null);
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
        } catch (Exception ignored) { return ""; }
    }

    private void appendAsset(StringBuilder bundle, String name) {
        String script = readAsset(name);
        if (script != null && !script.isEmpty()) bundle.append('\n').append(script).append('\n');
    }

    private void runScript(WebView view, String script, Runnable done) {
        if (script == null || script.isEmpty()) { done.run(); return; }
        view.evaluateJavascript(script, ignored -> done.run());
    }

    private String readAsset(String name) {
        try (InputStream in = getAssets().open(name)) {
            byte[] data = new byte[in.available()];
            int read = in.read(data);
            if (read > 0) return new String(data, 0, read, StandardCharsets.UTF_8);
        } catch (Exception ignored) {}
        return null;
    }

    private String qrPayloadForPhone(String phone) { return "https://sliqado.org/Qevyno/add/?phone=" + Uri.encode(phone); }

    private byte[] generateQrPng(String text) throws Exception {
        final int size = 520;
        BitMatrix matrix = new MultiFormatWriter().encode(text, BarcodeFormat.QR_CODE, size, size);
        Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        int dark = Color.rgb(23, 33, 43), light = Color.WHITE;
        for (int y = 0; y < size; y++) for (int x = 0; x < size; x++) bitmap.setPixel(x, y, matrix.get(x, y) ? dark : light);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
        bitmap.recycle();
        return out.toByteArray();
    }

    private String phoneHash(String phone) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(phone.getBytes(StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        for (byte b : hash) out.append(String.format(Locale.US, "%02x", b));
        return out.toString();
    }

    private File privateDir(String name) {
        File dir = new File(getFilesDir(), name);
        if (!dir.exists()) dir.mkdirs();
        return dir;
    }

    private File qrFileForPhone(String phone) throws Exception { return new File(privateDir("qevyno_qr"), "qr_" + phoneHash(phone) + ".png"); }
    private File chatFileForPhone(String phone) throws Exception { return new File(privateDir("qevyno_chats"), "chat_" + phoneHash(phone) + ".json"); }

    private byte[] readFile(File file) throws Exception {
        try (FileInputStream in = new FileInputStream(file); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192]; int n;
            while ((n = in.read(buffer)) > 0) out.write(buffer, 0, n);
            return out.toByteArray();
        }
    }

    private String getOrCreateStoredQr(String phone) {
        if (phone == null) return "";
        phone = phone.trim();
        if (!phone.matches("^\\+[1-9]\\d{7,14}$")) return "";
        try {
            File file = qrFileForPhone(phone); byte[] png;
            if (file.isFile() && file.length() > 100) png = readFile(file);
            else {
                png = generateQrPng(qrPayloadForPhone(phone));
                try (FileOutputStream out = new FileOutputStream(file, false)) { out.write(png); out.flush(); }
            }
            return "data:image/png;base64," + Base64.encodeToString(png, Base64.NO_WRAP);
        } catch (Exception ignored) { return ""; }
    }

    private class DeviceInfoBridge {
        @JavascriptInterface
        public String getCountryIso() {
            try {
                TelephonyManager tm = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
                if (tm != null) {
                    String network = tm.getNetworkCountryIso();
                    if (network != null && network.length() == 2) return network.toUpperCase(Locale.US);
                    String sim = tm.getSimCountryIso();
                    if (sim != null && sim.length() == 2) return sim.toUpperCase(Locale.US);
                }
            } catch (Exception ignored) {}
            String localeCountry = Locale.getDefault().getCountry();
            if (localeCountry != null && localeCountry.length() == 2) return localeCountry.toUpperCase(Locale.US);
            return "US";
        }

        @JavascriptInterface public String makeQr(String text) {
            if (text == null || text.isEmpty()) return "";
            try { return "data:image/png;base64," + Base64.encodeToString(generateQrPng(text), Base64.NO_WRAP); }
            catch (Exception ignored) { return ""; }
        }

        @JavascriptInterface public String getOrCreateQr(String phone) { return getOrCreateStoredQr(phone); }

        @JavascriptInterface
        public String loadChat(String phone) {
            try {
                if (phone == null || !phone.matches("^\\+[1-9]\\d{7,14}$")) return "[]";
                File f = chatFileForPhone(phone);
                if (!f.isFile() || f.length() < 2) return "[]";
                byte[] data = readFile(f);
                if (data.length > 16 * 1024 * 1024) return "[]";
                return new String(data, StandardCharsets.UTF_8);
            } catch (Exception ignored) { return "[]"; }
        }

        @JavascriptInterface
        public boolean saveChat(String phone, String json) {
            try {
                if (phone == null || !phone.matches("^\\+[1-9]\\d{7,14}$") || json == null) return false;
                byte[] data = json.getBytes(StandardCharsets.UTF_8);
                if (data.length > 16 * 1024 * 1024) return false;
                File f = chatFileForPhone(phone), tmp = new File(f.getAbsolutePath() + ".tmp");
                try (FileOutputStream out = new FileOutputStream(tmp, false)) { out.write(data); out.flush(); out.getFD().sync(); }
                if (f.exists() && !f.delete()) return false;
                return tmp.renameTo(f);
            } catch (Exception ignored) { return false; }
        }

        @JavascriptInterface public void pickProfilePicture() {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.setType("image/*");
                i.addCategory(Intent.CATEGORY_OPENABLE);
                startActivityForResult(Intent.createChooser(i, "Choose profile picture"), REQUEST_PROFILE_PICTURE);
            });
        }

        @JavascriptInterface public String consumePendingAddPhone() {
            String phone = pendingAddPhone; pendingAddPhone = ""; return phone == null ? "" : phone;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
}
