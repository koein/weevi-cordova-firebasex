// after_plugin_install.js — Patched to disable Xcode project editing
module.exports = function (context) {
    console.log("[Firebasex] Skipped Xcode pbxproj modifications (patched)");
    return;
};
