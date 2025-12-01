#import "FirebasePlugin.h"
#import <Foundation/Foundation.h>

@import FirebaseCore;
@import FirebaseAnalytics;
@import FirebaseMessaging;
@import FirebaseCrashlytics;

// ======================================================
// FIRESTORE REMOVED VERSION
// ======================================================

@implementation FirebasePlugin

static FirebasePlugin *firebasePluginInstance;

+ (FirebasePlugin*) firebasePluginInstance {
    return firebasePluginInstance;
}

- (void)pluginInitialize {

    firebasePluginInstance = self;
    NSLog(@"[FirebasePlugin] Initializing (NO Firestore)");

    // Ensure Firebase is configured only once
    if (![FIRApp defaultApp]) {
        [FIRApp configure];
    }

    // Messaging delegate
    [FIRMessaging messaging].delegate = self;

    // Request permission for notifications
    UNUserNotificationCenter *center =
        [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;

    NSLog(@"[FirebasePlugin] Initialization complete.");
}

// =======================================================================
// MARK: - ANALYTICS
// =======================================================================

- (void)logEvent:(CDVInvokedUrlCommand*)command {
    NSString *name = [command.arguments objectAtIndex:0];
    NSDictionary* params = [command.arguments objectAtIndex:1];

    if (name == nil) name = @"undefined_event";

    if (params != nil && [params isKindOfClass:[NSDictionary class]]) {
        [FIRAnalytics logEventWithName:name parameters:params];
    } else {
        [FIRAnalytics logEventWithName:name parameters:nil];
    }

    CDVPluginResult* result =
        [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result
                                callbackId:command.callbackId];
}

- (void)setUserId:(CDVInvokedUrlCommand*)command {
    NSString *userId = [command.arguments objectAtIndex:0];
    [FIRAnalytics setUserID:userId];

    CDVPluginResult* result =
        [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result
                                callbackId:command.callbackId];
}

- (void)setUserProperty:(CDVInvokedUrlCommand*)command {
    NSString *name = [command.arguments objectAtIndex:0];
    NSString *value = [command.arguments objectAtIndex:1];

    [FIRAnalytics setUserPropertyString:value forName:name];

    CDVPluginResult* result =
        [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result
                                callbackId:command.callbackId];
}

// =======================================================================
// MARK: - CRASHLYTICS
// =======================================================================

- (void)logError:(CDVInvokedUrlCommand*)command {
    NSString *message = [command.arguments objectAtIndex:0];
    if (message == nil) message = @"(null error)";

    [[FIRCrashlytics crashlytics] log:message];

    CDVPluginResult* result =
        [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result
                                callbackId:command.callbackId];
}

- (void)forceCrash:(CDVInvokedUrlCommand*)command {
    NSLog(@"[FirebasePlugin] Force crash triggered");
    assert(NO);
}

// =======================================================================
// MARK: - MESSAGING (FCM)
// =======================================================================

- (void)grantPermission:(CDVInvokedUrlCommand*)command {
    UNUserNotificationCenter *center =
        [UNUserNotificationCenter currentNotificationCenter];

    [center requestAuthorizationWithOptions:
        (UNAuthorizationOptionAlert |
         UNAuthorizationOptionSound |
         UNAuthorizationOptionBadge)
        completionHandler:^(BOOL granted, NSError *_Nullable error) {

        CDVPluginResult* result =
            [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                              messageAsBool:granted];

        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
    }];
}

- (void)getToken:(CDVInvokedUrlCommand*)command {
    [[FIRMessaging messaging] tokenWithCompletion:^(NSString* token,
                                                    NSError* error) {

        if (error) {
            CDVPluginResult* errorResult =
                [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                    messageAsString:error.localizedDescription];
            [self.commandDelegate sendPluginResult:errorResult
                                        callbackId:command.callbackId];
            return;
        }

        CDVPluginResult* result =
            [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                              messageAsString:token];
        [self.commandDelegate sendPluginResult:result
                                    callbackId:command.callbackId];
    }];
}

- (void)onTokenRefresh:(NSString*)token {
    if (!token) return;

    if (self.tokenRefreshCallbackId != nil) {
        CDVPluginResult* pluginResult =
            [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                              messageAsString:token];
        [pluginResult setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:pluginResult
                                    callbackId:self.tokenRefreshCallbackId];
    }
}

- (void)registerTokenRefreshCallback:(CDVInvokedUrlCommand*)command {
    self.tokenRefreshCallbackId = command.callbackId;

    CDVPluginResult* result =
        [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    [result setKeepCallbackAsBool:YES];

    [self.commandDelegate sendPluginResult:result
                                callbackId:command.callbackId];
}

// =======================================================================
// MARK: - APNS
// =======================================================================

- (void)application:(UIApplication*)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData*)deviceToken {

    [FIRMessaging messaging].APNSToken = deviceToken;
}

// =======================================================================
// END OF FILE
// =======================================================================

@end
