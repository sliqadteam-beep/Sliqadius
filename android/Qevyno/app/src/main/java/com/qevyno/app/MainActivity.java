package com.qevyno.app;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class MainActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        getWindow().setStatusBarColor(Color.rgb(7, 16, 12));
        getWindow().setNavigationBarColor(Color.rgb(7, 16, 12));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(7, 16, 12));
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
                String auth = readAsset("auth23.js");
                String ui = readAsset("ui26.js");
                String loading = readAsset("ui27.js");

                runScript(view, auth, () ->
                    runScript(view, ui, () ->
                        runScript(view, loading, () -> view.setVisibility(View.VISIBLE))
                    )
                );
            }
        });

        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
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
