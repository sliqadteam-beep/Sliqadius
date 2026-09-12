package com.qevyno.app;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class MediaBridge {
    public static final int REQUEST_CHAT_MEDIA = 5202;
    public static final long MAX_MEDIA_BYTES = 120L * 1024L * 1024L;
    private static final int DEFAULT_CHUNK_BYTES = 8 * 1024 * 1024;
    private static final String SERVER = "https://qevyno.sliqado.org";

    private final Activity activity;
    private final WebView webView;
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final ConcurrentHashMap<String, Boolean> downloads = new ConcurrentHashMap<>();

    private final Object selectionLock = new Object();
    private String selectedId = "";
    private File selectedFile = null;
    private String selectedMime = "";
    private String selectedName = "";
    private long selectedSize = 0;

    public MediaBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        cleanupPendingFiles();
    }

    public void shutdown() {
        io.shutdownNow();
    }

    @JavascriptInterface
    public void pickMedia() {
        activity.runOnUiThread(() -> {
            try {
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/*", "video/*"});
                activity.startActivityForResult(Intent.createChooser(i, null), REQUEST_CHAT_MEDIA);
            } catch (Exception e) {
                callbackError("", "picker_failed");
            }
        });
    }

    public boolean onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQUEST_CHAT_MEDIA) return false;
        if (resultCode != Activity.RESULT_OK || data == null || data.getData() == null) {
            return true;
        }
        final Uri uri = data.getData();
        io.execute(() -> prepareSelection(uri));
        return true;
    }

    private void prepareSelection(Uri uri) {
        String mime = "";
        String name = "media";
        long declaredSize = -1;
        try {
            mime = activity.getContentResolver().getType(uri);
            if (mime == null) mime = "";
            try (Cursor c = activity.getContentResolver().query(
                    uri,
                    new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE},
                    null, null, null)) {
                if (c != null && c.moveToFirst()) {
                    int ni = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    int si = c.getColumnIndex(OpenableColumns.SIZE);
                    if (ni >= 0 && !c.isNull(ni)) name = c.getString(ni);
                    if (si >= 0 && !c.isNull(si)) declaredSize = c.getLong(si);
                }
            }
            name = cleanName(name);
            mime = normalizeMime(mime, name);
            if (!(mime.startsWith("image/") || mime.startsWith("video/"))) {
                callbackError("", "unsupported_media");
                return;
            }
            if (declaredSize > MAX_MEDIA_BYTES) {
                callbackError("", "too_large");
                return;
            }

            String id = "sel_" + UUID.randomUUID().toString().replace("-", "");
            File dir = dir("sliqchat_media_pending");
            File outFile = new File(dir, id + extensionFor(mime, name));
            long copied = 0;
            try (InputStream in = activity.getContentResolver().openInputStream(uri);
                 FileOutputStream out = new FileOutputStream(outFile, false)) {
                if (in == null) throw new IllegalArgumentException("no input");
                byte[] buf = new byte[256 * 1024];
                int n;
                while ((n = in.read(buf)) > 0) {
                    copied += n;
                    if (copied > MAX_MEDIA_BYTES) throw new TooLargeException();
                    out.write(buf, 0, n);
                }
                out.flush();
                out.getFD().sync();
            } catch (TooLargeException e) {
                try { outFile.delete(); } catch (Exception ignored) {}
                callbackError("", "too_large");
                return;
            }
            if (copied < 1) {
                try { outFile.delete(); } catch (Exception ignored) {}
                callbackError("", "empty_file");
                return;
            }

            synchronized (selectionLock) {
                deleteSelectedLocked();
                selectedId = id;
                selectedFile = outFile;
                selectedMime = mime;
                selectedName = name;
                selectedSize = copied;
            }
            callbackSelected(id, Uri.fromFile(outFile).toString(), mime, copied, name);
        } catch (Exception e) {
            callbackError("", "prepare_failed");
        }
    }

    @JavascriptInterface
    public void cancelSelected(String id) {
        synchronized (selectionLock) {
            if (id != null && id.equals(selectedId)) {
                deleteSelectedLocked();
            }
        }
    }

    @JavascriptInterface
    public void sendSelected(
            String id,
            String recipientsJson,
            String caption,
            String clientId,
            String authToken,
            String contextJson) {
        final File file;
        final String mime;
        final String name;
        final long size;
        synchronized (selectionLock) {
            if (id == null || !id.equals(selectedId) || selectedFile == null || !selectedFile.isFile()) {
                callbackUploadError(clientId, "selection_missing");
                return;
            }
            file = selectedFile;
            mime = selectedMime;
            name = selectedName;
            size = selectedSize;
        }
        final String cap = caption == null ? "" : caption.trim();
        if (cap.length() > 4000) {
            callbackUploadError(clientId, "caption_too_long");
            return;
        }
        io.execute(() -> uploadSelected(id, file, mime, name, size, recipientsJson, cap, clientId, authToken, contextJson));
    }

    private void uploadSelected(
            String selectionId,
            File file,
            String mime,
            String name,
            long size,
            String recipientsJson,
            String caption,
            String clientId,
            String authToken,
            String contextJson) {
        try {
            if (authToken == null || authToken.trim().isEmpty()) throw new MediaException("unauthorized");
            JSONArray recipients = new JSONArray(recipientsJson == null ? "[]" : recipientsJson);
            if (recipients.length() < 1 || recipients.length() > 20) throw new MediaException("invalid_recipients");

            JSONObject createBody = new JSONObject();
            createBody.put("to", recipients);
            createBody.put("kind", mime.startsWith("video/") ? "video" : "image");
            createBody.put("mime", mime);
            createBody.put("size", size);
            createBody.put("name", name);
            createBody.put("caption", caption);
            createBody.put("client_id", clientId);
            if (contextJson != null && !contextJson.trim().isEmpty()) {
                try { createBody.put("context", new JSONObject(contextJson)); }
                catch (Exception ignored) { createBody.put("context", new JSONObject()); }
            }

            HttpResult created = null;
            Exception createNetworkError = null;
            for (int attempt = 0; attempt < 3; attempt++) {
                try {
                    created = jsonRequest("POST", SERVER + "/api/media-create", authToken, createBody, 20000, 30000);
                    createNetworkError = null;
                    break;
                } catch (Exception e) {
                    createNetworkError = e;
                    if (attempt >= 2) break;
                    try { Thread.sleep(650L * (attempt + 1)); } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
            if (createNetworkError != null || created == null) throw new MediaException("server_unreachable");
            if (!created.json.optBoolean("ok", false)) {
                throw new MediaException(created.json.optString("error", "media_create_failed"));
            }
            String uploadToken = created.json.optString("upload_token", "");
            if (uploadToken.isEmpty()) throw new MediaException("media_create_failed");
            int chunkBytes = created.json.optInt("chunk_bytes", DEFAULT_CHUNK_BYTES);
            chunkBytes = Math.max(256 * 1024, Math.min(DEFAULT_CHUNK_BYTES, chunkBytes));

            JSONObject finalResponse = null;
            Exception lastUploadError = null;
            for (int attempt = 0; attempt < 4; attempt++) {
                try {
                    finalResponse = uploadChunks(file, size, uploadToken, authToken, clientId, chunkBytes);
                    lastUploadError = null;
                    break;
                } catch (MediaException e) {
                    throw e;
                } catch (Exception e) {
                    lastUploadError = e;
                    if (attempt >= 3) break;
                    try { Thread.sleep(700L * (attempt + 1)); } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
            if (lastUploadError != null) throw lastUploadError;
            if (finalResponse == null || !finalResponse.optBoolean("complete", false)) throw new MediaException("upload_incomplete");
            String marker = finalResponse.optString("marker", "");
            String mediaToken = finalResponse.optString("media_token", uploadToken);
            if (marker.isEmpty() || mediaToken.isEmpty()) throw new MediaException("bad_media_response");

            File finalFile = localMediaFile(mediaToken, mime, name);
            if (!moveFile(file, finalFile)) throw new MediaException("local_save_failed");

            synchronized (selectionLock) {
                if (selectionId.equals(selectedId)) {
                    selectedId = "";
                    selectedFile = null;
                    selectedMime = "";
                    selectedName = "";
                    selectedSize = 0;
                }
            }
            callbackUploadComplete(clientId, marker, Uri.fromFile(finalFile).toString(), mediaToken);
        } catch (MediaException e) {
            cleanupSelectionAfterFailure(selectionId);
            callbackUploadError(clientId, e.code);
        } catch (Exception e) {
            cleanupSelectionAfterFailure(selectionId);
            callbackUploadError(clientId, "upload_failed");
        }
    }

    private JSONObject uploadChunks(
            File file,
            long total,
            String uploadToken,
            String authToken,
            String clientId,
            int chunkBytes) throws Exception {
        long offset = 0;
        int retries = 0;
        JSONObject last = new JSONObject();

        try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
            while (offset < total) {
                int len = (int)Math.min((long)chunkBytes, total - offset);
                HttpURLConnection c = null;
                try {
                    URL url = new URL(SERVER + "/api/media-upload/" + uploadToken);
                    c = (HttpURLConnection)url.openConnection();
                    c.setRequestMethod("PUT");
                    c.setConnectTimeout(20000);
                    c.setReadTimeout(60000);
                    c.setDoOutput(true);
                    c.setUseCaches(false);
                    c.setRequestProperty("Accept", "application/json");
                    c.setRequestProperty("Content-Type", "application/octet-stream");
                    c.setRequestProperty("Authorization", "Bearer " + authToken);
                    c.setRequestProperty("X-SliqChat-Offset", Long.toString(offset));
                    c.setFixedLengthStreamingMode(len);

                    raf.seek(offset);
                    try (OutputStream out = c.getOutputStream()) {
                        byte[] buf = new byte[256 * 1024];
                        int remaining = len;
                        while (remaining > 0) {
                            int n = raf.read(buf, 0, Math.min(buf.length, remaining));
                            if (n < 0) throw new IllegalArgumentException("short local file");
                            out.write(buf, 0, n);
                            remaining -= n;
                        }
                        out.flush();
                    }

                    int status = c.getResponseCode();
                    JSONObject response = readJsonResponse(c);
                    if (status == 409 && "offset_mismatch".equals(response.optString("error"))) {
                        long expected = response.optLong("expected_offset", -1);
                        if (expected < 0 || expected > total) throw new MediaException("offset_mismatch");
                        offset = expected;
                        retries++;
                        if (retries > 5) throw new MediaException("upload_retry_failed");
                        continue;
                    }
                    if (status < 200 || status >= 300 || !response.optBoolean("ok", false)) {
                        String err = response.optString("error", status == 413 ? "too_large" : "upload_failed");
                        throw new MediaException(err);
                    }
                    retries = 0;
                    offset = response.optLong("received", offset + len);
                    last = response;
                    int percent = total > 0 ? (int)Math.min(100, (offset * 100L) / total) : 100;
                    callbackProgress(clientId, percent);
                    if (response.optBoolean("complete", false)) return response;
                } finally {
                    if (c != null) c.disconnect();
                }
            }
        }
        return last;
    }

    @JavascriptInterface
    public String localMedia(String token, String mime, String name) {
        try {
            if (!validToken(token)) return "";
            File f = localMediaFile(token, normalizeMime(mime, name), name);
            return f.isFile() && f.length() > 0 ? Uri.fromFile(f).toString() : "";
        } catch (Exception e) {
            return "";
        }
    }

    @JavascriptInterface
    public void downloadMedia(
            String token,
            String authToken,
            String messageId,
            String mime,
            String name,
            String expectedSha256,
            long expectedSize) {
        if (!validToken(token) || authToken == null || authToken.isEmpty()) return;
        if (expectedSize < 1 || expectedSize > MAX_MEDIA_BYTES) {
            callbackDownloadError(messageId, token, "too_large");
            return;
        }
        if (downloads.putIfAbsent(token, Boolean.TRUE) != null) return;

        io.execute(() -> {
            File tmp = null;
            boolean success = false;
            try {
                File finalFile = localMediaFile(token, normalizeMime(mime, name), name);
                if (finalFile.isFile() && finalFile.length() == expectedSize) {
                    if (expectedSha256 != null && !expectedSha256.isEmpty()) {
                        String existingSha = sha256(finalFile);
                        if (!expectedSha256.equalsIgnoreCase(existingSha)) {
                            try { finalFile.delete(); } catch (Exception ignored) {}
                        } else {
                            callbackMediaReady(messageId, token, Uri.fromFile(finalFile).toString());
                            ackMedia(token, authToken);
                            return;
                        }
                    } else {
                        callbackMediaReady(messageId, token, Uri.fromFile(finalFile).toString());
                        ackMedia(token, authToken);
                        return;
                    }
                }

                tmp = new File(finalFile.getAbsolutePath() + ".tmp");
                HttpURLConnection c = null;
                long read = 0;
                try {
                    URL url = new URL(SERVER + "/api/media/" + token);
                    c = (HttpURLConnection)url.openConnection();
                    c.setRequestMethod("GET");
                    c.setConnectTimeout(20000);
                    c.setReadTimeout(120000);
                    c.setUseCaches(false);
                    c.setRequestProperty("Authorization", "Bearer " + authToken);
                    int status = c.getResponseCode();
                    if (status != 200) throw new MediaException(status == 404 ? "media_expired" : "download_failed");
                    long contentLength = c.getContentLengthLong();
                    if (contentLength > MAX_MEDIA_BYTES || (contentLength > 0 && contentLength != expectedSize)) {
                        throw new MediaException("media_size_mismatch");
                    }
                    try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(tmp, false)) {
                        byte[] buf = new byte[256 * 1024];
                        int n;
                        while ((n = in.read(buf)) > 0) {
                            read += n;
                            if (read > MAX_MEDIA_BYTES || read > expectedSize) throw new MediaException("too_large");
                            out.write(buf, 0, n);
                        }
                        out.flush();
                        out.getFD().sync();
                    }
                } finally {
                    if (c != null) c.disconnect();
                }
                if (read != expectedSize) throw new MediaException("media_size_mismatch");
                if (expectedSha256 != null && !expectedSha256.isEmpty()) {
                    String actual = sha256(tmp);
                    if (!expectedSha256.equalsIgnoreCase(actual)) throw new MediaException("media_checksum_failed");
                }
                if (finalFile.exists()) finalFile.delete();
                if (!tmp.renameTo(finalFile)) {
                    if (!copyFile(tmp, finalFile)) throw new MediaException("local_save_failed");
                    tmp.delete();
                }
                success = true;
                callbackMediaReady(messageId, token, Uri.fromFile(finalFile).toString());
                ackMedia(token, authToken);
            } catch (MediaException e) {
                callbackDownloadError(messageId, token, e.code);
            } catch (Exception e) {
                callbackDownloadError(messageId, token, "download_failed");
            } finally {
                if (!success && tmp != null) {
                    try { if (tmp.isFile()) tmp.delete(); } catch (Exception ignored) {}
                }
                downloads.remove(token);
            }
        });
    }

    private void ackMedia(String token, String authToken) {
        try {
            JSONObject body = new JSONObject();
            body.put("token", token);
            jsonRequest("POST", SERVER + "/api/media-ack", authToken, body, 10000, 10000);
        } catch (Exception ignored) {}
    }

    private HttpResult jsonRequest(
            String method,
            String url,
            String authToken,
            JSONObject body,
            int connectTimeout,
            int readTimeout) throws Exception {
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection)new URL(url).openConnection();
            c.setRequestMethod(method);
            c.setConnectTimeout(connectTimeout);
            c.setReadTimeout(readTimeout);
            c.setUseCaches(false);
            c.setDoOutput(true);
            c.setRequestProperty("Accept", "application/json");
            c.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            if (authToken != null && !authToken.isEmpty()) {
                c.setRequestProperty("Authorization", "Bearer " + authToken);
            }
            byte[] data = body.toString().getBytes(StandardCharsets.UTF_8);
            c.setFixedLengthStreamingMode(data.length);
            try (OutputStream out = c.getOutputStream()) {
                out.write(data);
                out.flush();
            }
            int status = c.getResponseCode();
            JSONObject json = readJsonResponse(c);
            return new HttpResult(status, json);
        } finally {
            if (c != null) c.disconnect();
        }
    }

    private JSONObject readJsonResponse(HttpURLConnection c) {
        try {
            InputStream in = c.getResponseCode() >= 400 ? c.getErrorStream() : c.getInputStream();
            if (in == null) return new JSONObject();
            try (InputStream use = in; ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = use.read(buf)) > 0 && out.size() < 2 * 1024 * 1024) out.write(buf, 0, n);
                String raw = new String(out.toByteArray(), StandardCharsets.UTF_8);
                return raw.isEmpty() ? new JSONObject() : new JSONObject(raw);
            }
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    private File localMediaFile(String token, String mime, String name) {
        return new File(dir("sliqchat_media"), token + extensionFor(mime, name));
    }

    private File dir(String name) {
        File d = new File(activity.getFilesDir(), name);
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private static String normalizeMime(String mime, String name) {
        String m = mime == null ? "" : mime.trim().toLowerCase(Locale.US);
        if (m.startsWith("image/") || m.startsWith("video/")) return m;
        String ext = "";
        int dot = name == null ? -1 : name.lastIndexOf('.');
        if (dot >= 0 && dot + 1 < name.length()) ext = name.substring(dot + 1).toLowerCase(Locale.US);
        if (!ext.isEmpty()) {
            String guessed = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
            if (guessed != null) return guessed.toLowerCase(Locale.US);
        }
        return m;
    }

    private static String extensionFor(String mime, String name) {
        String m = mime == null ? "" : mime.toLowerCase(Locale.US);
        if (m.equals("image/jpeg")) return ".jpg";
        if (m.equals("image/png")) return ".png";
        if (m.equals("image/gif")) return ".gif";
        if (m.equals("image/webp")) return ".webp";
        if (m.equals("image/heic")) return ".heic";
        if (m.equals("image/heif")) return ".heif";
        if (m.equals("video/mp4")) return ".mp4";
        if (m.equals("video/webm")) return ".webm";
        if (m.equals("video/3gpp")) return ".3gp";
        if (m.equals("video/quicktime")) return ".mov";
        if (m.equals("video/x-matroska")) return ".mkv";
        if (name != null) {
            int dot = name.lastIndexOf('.');
            if (dot >= 0 && name.length() - dot <= 8) {
                String ext = name.substring(dot).replaceAll("[^A-Za-z0-9.]", "");
                if (ext.matches("\\.[A-Za-z0-9]{1,6}")) return ext.toLowerCase(Locale.US);
            }
        }
        return ".bin";
    }

    private static String cleanName(String name) {
        String n = name == null ? "media" : name.trim();
        n = n.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_");
        if (n.length() > 128) n = n.substring(0, 128);
        return n.isEmpty() ? "media" : n;
    }

    private void cleanupPendingFiles() {
        try {
            File pending = dir("sliqchat_media_pending");
            long cutoff = System.currentTimeMillis() - 6L * 60L * 60L * 1000L;
            File[] files = pending.listFiles();
            if (files == null) return;
            for (File f : files) {
                try {
                    if (f.isFile() && f.lastModified() < cutoff) f.delete();
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}
    }

    private void cleanupSelectionAfterFailure(String selectionId) {
        synchronized (selectionLock) {
            if (selectionId != null && selectionId.equals(selectedId)) {
                deleteSelectedLocked();
            }
        }
    }

    private void deleteSelectedLocked() {
        if (selectedFile != null) {
            try { selectedFile.delete(); } catch (Exception ignored) {}
        }
        selectedId = "";
        selectedFile = null;
        selectedMime = "";
        selectedName = "";
        selectedSize = 0;
    }

    private static boolean validToken(String token) {
        return token != null && token.matches("^[A-Za-z0-9_-]{30,80}$");
    }

    private static boolean moveFile(File src, File dst) {
        try {
            if (dst.exists()) dst.delete();
            if (src.renameTo(dst)) return true;
            if (copyFile(src, dst)) {
                src.delete();
                return true;
            }
        } catch (Exception ignored) {}
        return false;
    }

    private static boolean copyFile(File src, File dst) {
        try (FileInputStream in = new FileInputStream(src); FileOutputStream out = new FileOutputStream(dst, false)) {
            byte[] buf = new byte[256 * 1024];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            out.flush();
            out.getFD().sync();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private static String sha256(File file) throws Exception {
        MessageDigest d = MessageDigest.getInstance("SHA-256");
        try (FileInputStream in = new FileInputStream(file)) {
            byte[] buf = new byte[256 * 1024];
            int n;
            while ((n = in.read(buf)) > 0) d.update(buf, 0, n);
        }
        StringBuilder s = new StringBuilder();
        for (byte b : d.digest()) s.append(String.format(Locale.US, "%02x", b));
        return s.toString();
    }

    private void eval(String js) {
        activity.runOnUiThread(() -> {
            try {
                if (webView != null) webView.evaluateJavascript(js, null);
            } catch (Exception ignored) {}
        });
    }

    private void callbackSelected(String id, String uri, String mime, long size, String name) {
        eval("window.sliqchatMediaSelected&&window.sliqchatMediaSelected(" +
                JSONObject.quote(id) + "," + JSONObject.quote(uri) + "," + JSONObject.quote(mime) + "," +
                size + "," + JSONObject.quote(name) + ");");
    }

    private void callbackError(String id, String error) {
        eval("window.sliqchatMediaSelectionError&&window.sliqchatMediaSelectionError(" +
                JSONObject.quote(id) + "," + JSONObject.quote(error) + ");");
    }

    private void callbackProgress(String clientId, int percent) {
        eval("window.sliqchatMediaUploadProgress&&window.sliqchatMediaUploadProgress(" +
                JSONObject.quote(clientId) + "," + percent + ");");
    }

    private void callbackUploadComplete(String clientId, String marker, String localUri, String token) {
        eval("window.sliqchatMediaUploadComplete&&window.sliqchatMediaUploadComplete(" +
                JSONObject.quote(clientId) + "," + JSONObject.quote(marker) + "," +
                JSONObject.quote(localUri) + "," + JSONObject.quote(token) + ");");
    }

    private void callbackUploadError(String clientId, String error) {
        eval("window.sliqchatMediaUploadError&&window.sliqchatMediaUploadError(" +
                JSONObject.quote(clientId == null ? "" : clientId) + "," + JSONObject.quote(error) + ");");
    }

    private void callbackMediaReady(String messageId, String token, String localUri) {
        eval("window.sliqchatMediaReady&&window.sliqchatMediaReady(" +
                JSONObject.quote(messageId) + "," + JSONObject.quote(token) + "," + JSONObject.quote(localUri) + ");");
    }

    private void callbackDownloadError(String messageId, String token, String error) {
        eval("window.sliqchatMediaDownloadError&&window.sliqchatMediaDownloadError(" +
                JSONObject.quote(messageId) + "," + JSONObject.quote(token) + "," + JSONObject.quote(error) + ");");
    }

    private static final class HttpResult {
        final int status;
        final JSONObject json;
        HttpResult(int status, JSONObject json) {
            this.status = status;
            this.json = json == null ? new JSONObject() : json;
        }
    }

    private static final class TooLargeException extends Exception {}

    private static final class MediaException extends Exception {
        final String code;
        MediaException(String code) {
            super(code);
            this.code = code == null || code.isEmpty() ? "media_error" : code;
        }
    }
}
