package org.sliqado.sliqgames

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.TextView

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private lateinit var hubButton: TextView
    private val hubUrl = "file:///android_asset/hub/index.html"

    @SuppressLint("SetJavaScriptEnabled")
    @Suppress("DEPRECATION")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = Color.rgb(8, 10, 13)
        window.navigationBarColor = Color.rgb(8, 10, 13)

        val root = FrameLayout(this).apply {
            setBackgroundColor(Color.rgb(8, 10, 13))
        }

        webView = WebView(this).apply {
            setBackgroundColor(Color.rgb(8, 10, 13))
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true
                builtInZoomControls = false
                displayZoomControls = false
                mediaPlaybackRequiresUserGesture = false
                cacheMode = WebSettings.LOAD_DEFAULT
            }
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    hubButton.visibility = if (url == null || url.contains("/hub/index.html")) {
                        View.GONE
                    } else {
                        View.VISIBLE
                    }
                }
            }
        }

        root.addView(
            webView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        )

        hubButton = TextView(this).apply {
            text = "‹  Hub"
            setTextColor(Color.WHITE)
            textSize = 15f
            gravity = Gravity.CENTER
            setPadding(dp(15), 0, dp(15), 0)
            background = GradientDrawable().apply {
                cornerRadius = dp(15).toFloat()
                setColor(Color.argb(230, 18, 22, 29))
                setStroke(dp(1), Color.rgb(57, 255, 136))
            }
            elevation = dp(8).toFloat()
            visibility = View.GONE
            setOnClickListener { webView.loadUrl(hubUrl) }
        }

        root.addView(
            hubButton,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                dp(46),
                Gravity.TOP or Gravity.START
            ).apply {
                leftMargin = dp(12)
                topMargin = dp(12)
            }
        )

        setContentView(root)
        webView.loadUrl(hubUrl)
    }

    override fun onBackPressed() {
        if (webView.url != hubUrl && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
