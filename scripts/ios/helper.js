// helper.js — Patched empty helper for Appflow-safe build
module.exports = {
    getXcodeProjectPath: function () {
        return null;
    },
    addShellScriptBuildPhase: function () { return; },
    removeShellScriptBuildPhase: function () { return; },
    ensureRunpathSearchPath: function () { return; },
    applyPodsPostInstall: function () { return false; },
    applyPluginVarsToPlists: function () { return; },
    applyPluginVarsToPodfile: function () { return false; },
    ensureEncodedAppIdInUrlSchemes: function () { return; }
};
