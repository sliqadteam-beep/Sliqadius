plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "org.sliqado.sliqgames"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.sliqado.sliqgames"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    sourceSets.getByName("main").assets.srcDir(layout.buildDirectory.dir("generated/offlineGames"))
}

val prepareOfflineGames by tasks.registering(Sync::class) {
    into(layout.buildDirectory.dir("generated/offlineGames"))

    from("../../crushers") {
        into("crushers")
        exclude("*.zip")
    }
    from("../../sandbox") {
        into("sandbox")
    }
    from("../../city") {
        into("city")
        exclude("*.zip")
    }
}

tasks.named("preBuild").configure {
    dependsOn(prepareOfflineGames)
}
