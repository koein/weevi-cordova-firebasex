// before_plugin_install.js — Patched for Appflow / CI safety
module.exports = function (context) {
    console.log("[Firebasex] Skipped Cocoapods version validation (patched)");
    return;
};
