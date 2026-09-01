# Android 17 + Multiuser tools

These scripts are preparation tools only. They do not flash a phone.

## Initialize-Workspace.ps1
Creates the local project folders, release metadata template, compatibility file and the minimal multi-user overlay template.

## Prepare-Release.ps1
Takes a finished build file, copies it into the release folder, calculates SHA-256 and file size, and generates release.json plus a checksum file. Public availability remains false unless explicitly enabled with -MarkAvailable and a download URL.

## Verify-Multiuser-Source.ps1
Checks the local source/configuration tree for config_multiuserMaximumUsers >= 2 and config_enableMultiUserUI=true.

## Verify-Running-System.ps1
Read-only ADB check for a connected emulator/device. It reads the current multi-user properties and lists Android users. It does not change the device.

Never publish or flash a build only because the source check passes. The actual built image and exact target hardware still need testing.
