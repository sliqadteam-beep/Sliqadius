plugins { id("com.android.application") }
android {
    namespace = "com.qevyno.app"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.qevyno.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 33
        versionName = "2.9.21"
    }
    buildTypes { release { isMinifyEnabled = false } }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
dependencies {
    implementation("com.google.zxing:core:3.5.3")
}
