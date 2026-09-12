package com.qevyno.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) return;
        String action = intent.getAction();
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action)
            && !Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) return;

        SharedPreferences p = context.getSharedPreferences(NotificationService.PREFS_NAME, Context.MODE_PRIVATE);
        if (!p.getBoolean("enabled", false)) return;
        String token = p.getString("token", "");
        if (token == null || token.isEmpty()) return;

        try {
            Intent service = new Intent(context, NotificationService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(service);
            else context.startService(service);
        } catch (Exception ignored) {}
    }
}
