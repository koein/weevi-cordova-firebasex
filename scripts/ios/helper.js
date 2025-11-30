// SAFE MINIMAL helper.js for FirebaseX (Analytics + Messaging + Crashlytics)

var fs = require("fs");
var path = require("path");
var plist = require('plist');
var utilities = require("../lib/utilities");

function ensureUrlSchemeInPlist(urlScheme, appPlist){
    var appPlistModified = false;
    if(!appPlist['CFBundleURLTypes']) appPlist['CFBundleURLTypes'] = [];
    var entry = null;
    var entryIndex = null;

    appPlist['CFBundleURLTypes'].forEach((e, i) => {
        if(e['CFBundleURLSchemes'] && e['CFBundleURLSchemes'].includes(urlScheme)) {
            entry = e;
            entryIndex = i;
        }
    });

    if(entry === null){
        entry = { CFBundleTypeRole: 'Editor', CFBundleURLSchemes: [urlScheme] };
        appPlist['CFBundleURLTypes'].push(entry);
        appPlistModified = true;
    }

    return { plist: appPlist, modified: appPlistModified };
}

module.exports = {

    // ❌ removed: getXcodeProjectPath
    // ❌ removed: addShellScriptBuildPhase
    // ❌ removed: removeShellScriptBuildPhase
    // ❌ removed: ensureRunpathSearchPath

    // ------------------------------------------------------
    // SAFE: podfile modifications (Analytics/FCM/Crashlytics)
    // ------------------------------------------------------
    applyPluginVarsToPodfile: function(pluginVariables, iosPlatform){
        var podFile = fs.readFileSync(path.resolve(iosPlatform.podFile), 'utf8');
        var podFileModified = false;
        var versionRegex = /\d+\.\d+\.\d+[^'"]*/;
        var firebasePodRegex = /pod 'Firebase([^']+)', '(\d+\.\d+\.\d+[^'"]*)'/g;

        if(pluginVariables['IOS_FIREBASE_SDK_VERSION']){
            var matches = podFile.match(firebasePodRegex);
            if(matches){
                matches.forEach((match) => {
                    var currentVersion = match.match(versionRegex)[0];
                    if(!match.includes(pluginVariables['IOS_FIREBASE_SDK_VERSION'])){
                        podFile = podFile.replace(currentVersion, pluginVariables['IOS_FIREBASE_SDK_VERSION']);
                        podFileModified = true;
                    }
                });
            }
        }

        if(podFileModified){
            fs.writeFileSync(path.resolve(iosPlatform.podFile), podFile);
        }

        return podFileModified;
    },

    // ------------------------------------------------------
    // SAFE: Plist updates (Analytics/FCM/Crashlytics)
    // ------------------------------------------------------
    applyPluginVarsToPlists: function(pluginVariables, iosPlatform){
        var googlePlist = plist.parse(fs.readFileSync(path.resolve(iosPlatform.dest), 'utf8'));
        var appPlist = plist.parse(fs.readFileSync(path.resolve(iosPlatform.appPlist), 'utf8'));

        var googlePlistModified = false;
        var appPlistModified = false;

        if(pluginVariables['FIREBASE_CRASHLYTICS_COLLECTION_ENABLED']){
            googlePlist["FirebaseCrashlyticsCollectionEnabled"] =
                pluginVariables['FIREBASE_CRASHLYTICS_COLLECTION_ENABLED'] !== "false";
            googlePlistModified = true;
        }

        if(pluginVariables['FIREBASE_ANALYTICS_COLLECTION_ENABLED']){
            googlePlist["FIREBASE_ANALYTICS_COLLECTION_ENABLED"] =
                pluginVariables['FIREBASE_ANALYTICS_COLLECTION_ENABLED'] !== "false";
            googlePlistModified = true;
        }

        if(pluginVariables['FIREBASE_FCM_AUTOINIT_ENABLED']){
            appPlist["FirebaseMessagingAutoInitEnabled"] =
                pluginVariables['FIREBASE_FCM_AUTOINIT_ENABLED'] === "true";
            appPlistModified = true;
        }

        if(googlePlistModified)
            fs.writeFileSync(path.resolve(iosPlatform.dest), plist.build(googlePlist));

        if(appPlistModified)
            fs.writeFileSync(path.resolve(iosPlatform.appPlist), plist.build(appPlist));
    },

    // SAFE
    ensureEncodedAppIdInUrlSchemes: function (iosPlatform){
        var googlePlist = plist.parse(fs.readFileSync(path.resolve(iosPlatform.dest), 'utf8'));
        var appPlist = plist.parse(fs.readFileSync(path.resolve(iosPlatform.appPlist), 'utf8'));
        var encoded = 'app-' + googlePlist["GOOGLE_APP_ID"].replace(/:/g, '-');

        var result = ensureUrlSchemeInPlist(encoded, appPlist);
        if(result.modified){
            fs.writeFileSync(path.resolve(iosPlatform.appPlist), plist.build(result.plist));
        }
    }
};
