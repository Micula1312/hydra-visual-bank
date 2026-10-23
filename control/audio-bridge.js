// Browser microphone access is owned by the SCREEN tab so its audio analyser
// stays alive even when the mobile controller disconnects.
// Requests from CONTROL are sent to SCREEN over BroadcastChannel.
// Browser permissions must be granted in the SCREEN tab.
export const audioBands=['level','bass','mid','high'];