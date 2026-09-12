package com.qevyno.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

public final class UpdateChecker {
    private static final String UPDATE_URL = "https://sliqado.org/qevyno/update.json";
    private static final AtomicBoolean RUNNING = new AtomicBoolean(false);

    private UpdateChecker() {}

    private static String language() {
        String lang = Locale.getDefault().getLanguage();
        if (lang == null) return "en";
        lang = lang.toLowerCase(Locale.US);
        if (lang.equals("ua")) lang = "uk";
        switch (lang) {
            case "de": case "es": case "fr": case "it": case "pt": case "nl":
            case "pl": case "tr": case "uk": case "ru": case "ja": case "ko":
            case "zh": case "ar": return lang;
            default: return "en";
        }
    }

    // title, later, download, generic update, version update
    private static String[] ui(String lang) {
        switch (lang) {
            case "de": return new String[]{"Update verfügbar","Später","Update herunterladen","Ein neues SliqChat-Update ist verfügbar.","SliqChat %s ist verfügbar."};
            case "es": return new String[]{"Actualización disponible","Más tarde","Descargar actualización","Hay una nueva actualización de SliqChat disponible.","SliqChat %s está disponible."};
            case "fr": return new String[]{"Mise à jour disponible","Plus tard","Télécharger la mise à jour","Une nouvelle mise à jour de SliqChat est disponible.","SliqChat %s est disponible."};
            case "it": return new String[]{"Aggiornamento disponibile","Più tardi","Scarica aggiornamento","È disponibile un nuovo aggiornamento di SliqChat.","SliqChat %s è disponibile."};
            case "pt": return new String[]{"Atualização disponível","Mais tarde","Transferir atualização","Está disponível uma nova atualização do SliqChat.","SliqChat %s está disponível."};
            case "nl": return new String[]{"Update beschikbaar","Later","Update downloaden","Er is een nieuwe SliqChat-update beschikbaar.","SliqChat %s is beschikbaar."};
            case "pl": return new String[]{"Dostępna aktualizacja","Później","Pobierz aktualizację","Dostępna jest nowa aktualizacja SliqChat.","SliqChat %s jest dostępne."};
            case "tr": return new String[]{"Güncelleme mevcut","Daha sonra","Güncellemeyi indir","Yeni bir SliqChat güncellemesi mevcut.","SliqChat %s mevcut."};
            case "uk": return new String[]{"Доступне оновлення","Пізніше","Завантажити оновлення","Доступне нове оновлення SliqChat.","Доступний SliqChat %s."};
            case "ru": return new String[]{"Доступно обновление","Позже","Скачать обновление","Доступно новое обновление SliqChat.","Доступен SliqChat %s."};
            case "ja": return new String[]{"アップデートがあります","後で","アップデートをダウンロード","新しい SliqChat アップデートがあります。","SliqChat %s が利用できます。"};
            case "ko": return new String[]{"업데이트 사용 가능","나중에","업데이트 다운로드","새 SliqChat 업데이트를 사용할 수 있습니다.","SliqChat %s을 사용할 수 있습니다."};
            case "zh": return new String[]{"有可用更新","稍后","下载更新","有新的 SliqChat 更新可用。","SliqChat %s 已可用。"};
            case "ar": return new String[]{"يتوفر تحديث","لاحقًا","تنزيل التحديث","يتوفر تحديث جديد لـ SliqChat.","يتوفر SliqChat %s."};
            default: return new String[]{"Update available","Later","Download Update","A new SliqChat update is available.","SliqChat %s is available."};
        }
    }

    public static void check(Activity activity) {
        if (activity == null || activity.isFinishing()) return;
        if (!RUNNING.compareAndSet(false, true)) return;

        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                URL url = new URL(UPDATE_URL + "?t=" + System.currentTimeMillis());
                connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(3000);
                connection.setReadTimeout(3000);
                connection.setUseCaches(false);
                connection.setRequestProperty("Accept", "application/json");
                connection.setRequestProperty("Cache-Control", "no-cache");

                int status = connection.getResponseCode();
                if (status < 200 || status >= 300) return;

                byte[] data;
                try (InputStream in = connection.getInputStream();
                     ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[4096];
                    int read;
                    while ((read = in.read(buffer)) > 0) out.write(buffer, 0, read);
                    data = out.toByteArray();
                }

                JSONObject metadata = new JSONObject(new String(data, StandardCharsets.UTF_8));
                long remoteCode = metadata.optLong("versionCode", 0);
                String remoteName = metadata.optString("versionName", "").trim();
                String apkUrl = metadata.optString("apkUrl", "").trim();

                android.content.pm.PackageInfo packageInfo =
                    activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0);
                long currentCode = Build.VERSION.SDK_INT >= 28
                    ? packageInfo.getLongVersionCode()
                    : packageInfo.versionCode;

                if (remoteCode <= currentCode) return;
                if (!apkUrl.startsWith("https://sliqado.org/")) return;

                String lang = language();
                String[] text = ui(lang);
                String versionLine = remoteName.isEmpty()
                    ? text[3]
                    : String.format(Locale.getDefault(), text[4], remoteName);

                String localizedNotes = metadata.optString("notes_" + lang, "").trim();
                if (localizedNotes.isEmpty() && lang.equals("en")) {
                    localizedNotes = metadata.optString("notes", "").trim();
                }
                String message = localizedNotes.isEmpty()
                    ? versionLine
                    : versionLine + "\n\n" + localizedNotes;

                activity.runOnUiThread(() -> {
                    if (activity.isFinishing() || activity.isDestroyed()) return;
                    new android.app.AlertDialog.Builder(activity)
                        .setTitle(text[0])
                        .setMessage(message)
                        .setNegativeButton(text[1], null)
                        .setPositiveButton(text[2], (dialog, which) -> {
                            try {
                                Intent browser = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                                activity.startActivity(browser);
                            } catch (Exception ignored) {}
                        })
                        .show();
                });
            } catch (Exception ignored) {
                // Update checks must never prevent SliqChat from starting.
            } finally {
                if (connection != null) connection.disconnect();
                RUNNING.set(false);
            }
        }, "SliqChat-Update-Check").start();
    }
}
