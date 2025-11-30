// before_plugin_install.js — Safe version for Appflow
module.exports = function (context) {
    // Skip Cocoapods version check on Appflow to avoid ENOENT errors
    try {
        if (process.env.CI || process.env.CORDOVA_APPFLOW) {
            console.log("[Firebasex] Skipping Cocoapods version check on CI/Appflow");
            return;
        }
    } catch (e) {
        // Fallback
        return;
    }

    // Local environment check only
    const execSync = require('child_process').execSync;
    const semver = require('semver');
    const { setContext } = require('../lib/utilities');

    const minCocoapodsVersion = "^1.11.2";

    let version;
    try {
        version = execSync('pod --version', { encoding: 'utf8' }).match(/(\d+\.\d+\.\d+)/)[1];
    } catch (err) {
        throw new Error("cocoapods not found - please install cocoapods >= " + minCocoapodsVersion);
    }

    if (!semver.valid(version)) {
        throw new Error("Invalid cocoapods version, reinstall cocoapods@" + minCocoapodsVersion + ": " + version);
    } else if (!semver.satisfies(version, minCocoapodsVersion)) {
        throw new Error("cocoapods version out-of-date — update to cocoapods@" + minCocoapodsVersion + ". Current: " + version);
    }

    setContext(context);
};
