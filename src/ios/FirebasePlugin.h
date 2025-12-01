// Functions
- (void)functionsHttpsCallable:(CDVInvokedUrlCommand*)command;

// Installations
- (void)getInstallationId:(CDVInvokedUrlCommand*)command;
- (void)getInstallationToken:(CDVInvokedUrlCommand*)command;
- (void)deleteInstallationId:(CDVInvokedUrlCommand*)command;

// Internals
+ (FirebasePlugin *)firebasePlugin;
+ (NSString*)appleSignInNonce;
// REMOVED: + (void) setFirestore:(FIRFirestore*) firestoreInstance;
- (void)handlePluginExceptionWithContext:(NSException*)exception :(CDVInvokedUrlCommand*)command;
- (void)handlePluginExceptionWithoutContext:(NSException*)exception;
- (void)_logError:(NSString*)msg;
- (void)_logInfo:(NSString*)msg;
- (void)_logMessage:(NSString*)msg;
- (BOOL)_shouldEnableCrashlytics;
- (NSNumber*)saveAuthCredential:(FIRAuthCredential *)authCredential;
- (void)executeGlobalJavascript:(NSString*)jsString;

- (void)createChannel:(CDVInvokedUrlCommand*)command;
- (void)setDefaultChannel:(CDVInvokedUrlCommand*)command;
- (void)deleteChannel:(CDVInvokedUrlCommand*)command;
- (void)listChannels:(CDVInvokedUrlCommand*)command;

@property (nonatomic, readonly) BOOL isFCMEnabled;

@property (nonatomic, copy) NSString *notificationCallbackId;
@property (nonatomic, copy) NSString *openSettingsCallbackId;
@property (nonatomic, copy) NSString *tokenRefreshCallbackId;
@property (nonatomic, copy) NSString *apnsTokenRefreshCallbackId;
@property (nonatomic, copy) NSString *appleSignInCallbackId;

@property (nonatomic, retain) NSMutableArray *notificationStack;
@property(nonatomic, nullable) id<NSObject> installationIDObserver;

@end
