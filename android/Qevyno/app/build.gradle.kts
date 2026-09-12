plugins { id("com.android.application") }
android {
    namespace = "com.qevyno.app"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.qevyno.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 3
        versionName = "2.1.0"
    }
    buildTypes { release { isMinifyEnabled = false } }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
