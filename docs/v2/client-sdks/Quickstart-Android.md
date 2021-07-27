---
title: Quickstart - Android
nav: 10
---

## Introduction

Welcome to 100ms!

100ms makes an SDK (for android, ios and web) to abstract away the complexities of video conferencing. It helps  you to build your own video conferencing app.

Note: This is the guide for joining rooms without roles. For the meeting links created from the dashboard and not a custom server implementation.

## How it works end to end

This guide will help you create your own stunning video/audio conferencing app.

Here's an overview of what you'd do to get video conferencing working end to end.

1. Add the SDK to your app.
2. Build out the login and video room activities.
3. Sign up for your own dashboard @ [100ms](https://dashboard.100ms.live/register) to create meeting links.
    - Everyone who opens the link (from the app built with the SDK) joins the same video chat.

## Supported Android API Levels

100ms' Android SDK supports Android API level 21 and higher. It is built for armeabi-v7a, arm64-v8a, x86, and x86_64 architectures.

## Building the app

### Adding the SDK

#### 1. Add dependency to 100ms lib

-   Add the JitPack repository to your build file. Add it in your root `build.gradle` at the end of repositories of `allprojects`:

```json
allprojects {
		repositories {
			...
			maven { url 'https://jitpack.io' }
		}
	}
```
[todo mention that it needs to be added to settings.gradle instead]

-   Add the 100ms sdk dependency to your app-level `gradle` [![](https://jitpack.io/v/100mslive/android-sdk.svg)](https://jitpack.io/#100mslive/android-sdk)

```json
dependencies {
        // See the version in the jitpack badge above.
		implementation 'com.github.100mslive:android-sdk:x.x.x' 
	}
```

### 2. Add other dependencies

Add all the following libraries in your app-level Gradle file as dependencies.

-   If you are already using any of the following libraries (except for webrtc) in your application, you don't need to change the versions.
-   Make sure `webrtc` uses the same version as below.

```bash
implementation 'org.webrtc:google-webrtc:1.0.32006'
implementation 'com.squareup.okhttp3:okhttp:4.9.1'
implementation 'com.google.code.gson:gson:2.8.6'
implementation 'org.jetbrains:annotations:15.0'
```

That's the bare minimum, if you want to follow along with how to build an app you'll also need:

```bash
    // 100ms
    implementation 'org.webrtc:google-webrtc:1.0.32006'
    implementation 'com.github.100mslive:android-sdk:2.0.5' 

    // Networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation "com.squareup.okhttp3:okhttp:4.9.1"
    implementation 'com.google.code.gson:gson:2.8.7'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'

    // Background handling
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.5.0'

    // Viewmodel
    implementation "androidx.lifecycle:lifecycle-viewmodel-ktx:2.3.1"
    // for by viewModels
    implementation "androidx.activity:activity-ktx:1.2.4"

    // Livedata
    implementation "androidx.lifecycle:lifecycle-livedata-ktx:2.3.1"
```

### 3. Sign up to the dashboard

You'll need a 100ms account to create video rooms for you to join with the app.

Go to [https://dashboard.100ms.live/register] and sign up for an account. Be sure to create a video conferencing room and take note of the url. 

This is what we'll call the video call url.
<!-- [todo add video here] -->
<!-- ![](/docs/v2/getting-started-android/new-project-type.png) -->

## Create and instantiate 100ms SDK

To use the SDK methods, create an instance via the builder. Here's the simplest way.
```kotlin
val hmsSDK = HMSSDK
    .Builder(application) // pass the application context
    .build()
```

Advanced configurations can be seen at: [todo api reference]

## Joining a video call

To join a video chat you need to call the `join` method on HMSSDK. This method takes two parameters.
1. The HMSConfig (which contains username and authentication token as required parameters though advanced ones exist)
2. The HMSUpdateListeners which let you know when people join or leave or other things happen in the video chat.

It would look like:

```kotlin

    hmsSDK.join(hmsConfig, hmsUpdateListeners)

```

Let's see how to get instances of these objects.

#### Getting the HMSConfig ready
Username:
This can be whatever the user decides. Take it in a login form.
<!-- Currently working on this section -->
Auth Token:

You need a new auth token everytime you want to join a call. Here's a retrofit interface for how to request one.


```kotlin

    import retrofit2.http.Body
    import retrofit2.http.Header
    import retrofit2.http.POST

    interface HmsAuthTokenApi {

        @POST("https://prod-in.100ms.live/hmsapi/get-token")
        suspend fun getAuthToken(@Header("subdomain") subdomain : String,
                                @Body tokenRequestWithCode: TokenRequestWithCode
        ) : TokenResponse
    }

```

This is a HTTP POST call with a header called "subdomain", a JSON body with the format we'll see in TokenRequestWithCode and the server will respond with a TokenResponse, which we'll see shortly as well. The API url for requesting auth tokens is `https://prod-in.100ms.live/hmsapi/get-token`

In this example, the retrofit api call is made with a coroutine suspend function but it could be made with RxJava or whatever asynchronous call mechanism you prefer.

Subdomain is the subdomain of the video call joining link which you got from the dashboard.

For example if the link is https://aniket.app.100ms.live/meeting/correct-horse-battery

Then the subdomain is: "aniket.app.100ms.live". Here's an easy function to extract the subdomain.

```kotlin
    private fun getSubdomainForMeetingUrl( meetingUrl : String ) : String {
        return java.net.URI(meetingUrl).host
    }
```

As seen above it's passed as a header to the auth token request.

The body of the request is a TokenRequestWithCode which is a class that looks like:

```kotlin
    data class TokenRequestWithCode constructor(
        @SerializedName("code") val code: String,
        @SerializedName("user_id") val userId: String = UUID.randomUUID().toString(),
    )
```

Where code is the meeting code. Meeting codes are determined from the video call joining links which you get from the dashboard.

For example if the link is: https://aniket.app.100ms.live/meeting/correct-horse-battery

Then the code is the string "correct-horse-battery".
Here's an easy function to extract that part of the url:

```kotlin
    private fun getCodeFromMeetingUrl(meetingUrl: String) : String {
        val path = android.net.Uri.parse(meetingUrl).lastPathSegment!!
        return path
    }
```

userId can be any UUID and you let it autogenerate as seen above.

TokenResponse looks like:

```kotlin
    import com.google.gson.annotations.SerializedName

    data class TokenResponse(
        @SerializedName("token") val token: String
    )

```

Which means the server responds with a JSON object with the token key set to the token value.


[todo remove this link https://www.notion.so/100ms/Room-Links-Create-room-from-Dashboard-3778aba899c347a8aba0bf6dc70ad948#236875b9fe0d4b94ba2211e34c2f3946]


Advanced:

You can also create links for specific roles, such as teachers or students each with their own privileges like being able to show video or not. Roles are yours to create and define! Their link handling a bit different too. [todo link to the second way of parsing links].
If you're already dealing with roles, please go here [todo make a link] to see how to parse those links for ids.

#### Creating an HMSConfig instance

The username is whatever the user wants to called in the chat. You can ask this in the login screen.

```kotlin
// Create a new HMSConfig
val config = HMSConfig(
        username,
        authToken,
      )

```

username is the name that the user wants to be displayed while in the room.
authToken, is token retrieved from an auth token API call, this must be made each time the HMSConfig is created to join a room.


## Add event listeners

100ms SDK provides callbacks to the client app about any change or update happening in the room after a user has joined by implementing `HMSUpdateListener` . These updates can be used to render the video on screen or to display other info regarding the room.

The main ones you need to know about to get up and running are:

1. `onJoin` which lets you know when you've joined the room.
2. `onPeerUpdate` which lets you know when someone else has joined the room.

`onPeerUpdate` also gives you a `HMSPeer` object from which you can get the remote person's audio and video.

```java
      val hmsUpdateListener = object: HMSUpdateListener{

        override fun onJoin(room: HMSRoom) {
          // This will be called on a successful JOIN of the room by the user
          // This is the point where applications can stop showing its loading state
        }

        override fun onPeerUpdate(type: HMSPeerUpdate, peer: HMSPeer) {
          // This will be called whenever there is an update on an existing peer
          // or a new peer got added/existing peer is removed.
          // This callback can be used to keep a track of all the peers in the room
        }

        override fun onRoomUpdate(type: HMSRoomUpdate, hmsRoom: HMSRoom) {
          // This is called when there is a change in any property of the Room
        }

        override fun onTrackUpdate(type: HMSTrackUpdate, track: HMSTrack, peer: HMSPeer) {
          // This is called when there are updates on an existing track
          // or a new track got added/existing track is removed
          // This callback can be used to render the video on screen whenever a track gets added
        }

        override fun onMessageReceived(message: HMSMessage) {
          // This is called when there is a new broadcast message from any other peer in the room
          // This can be used to implement chat is the room
        }

        override fun onError(error: HMSException) {
          // This will be called when there is an error in the system
          // and SDK has already retried to fix the error
        }

        override fun onReconnecting(error: HMSException) {
          // This is called when connection reestablishment starts
          // This can be used to show a loading notification in the UI
          // Parameter error: the error from the action that failed and caused the connection reestablishment
        }

        override fun onReconnected() {
          // This is called when the connection reestablishment completed susccessfully
        }

      }
```

# STILL IN PROGRESS
## How to listen to Track, Peer and Room updates

The `HMS` SDK sends updates to the application about any change in `HMSPeer` , `HMSTrack` or `HMSRoom` via the callbacks in `HMSUpdateListener` . Application need to listen to the corresponding updates in `onPeerUpdate` , `onTrackUpdate` or `onRoomUpdate`

The following are the different types of updates that are emitted by the SDK

```
HMSPeerUpdate
    case PEER_JOINED - A new peer joins the room
    case PEER_LEFT - An existing peer leaves the room
    case BECAME_DOMINANT_SPEAKER - A peer becomes a dominant speaker
    case NO_DOMINANT_SPEAKER - There is silence in the room (No speaker is detected)

HMSTrackUpdate
    case TRACK_ADDED - A new track is added by a remote peer
    case TRACK_REMOVED - An existing track is removed from a remote peer
    case TRACK_MUTED - An existing track of a remote peer is muted
    case TRACK_UNMUTED - An existing track of a remote peer is unmuted
    case TRACK_DESCRIPTION_CHANGED - The optional description of a track of a remote peer is changed
```

## How to use Preview API

`HMSSDK` provides a `preview` API which can be used by client apps to show preview screnn of the camera device being used to capture the video. Calling this API also means the SDK makes sure that there is a valid network path between the client and the servers. The token used is also validated in this.

```java
// Call the preview api by passing the config object
sdk.preview(config: HMSConfig, listener: HMSPreviewListener)

interface HMSPreviewListener {
	/** Send the list of local tracks which can be shown in a Preview Screen
	 * Here, room can be used to get all peers already in the room
	*/
	override onPreview(room: HMSRoom, localTracks: Array<HMSTrack>)
	/** Call Error on case of any errors happening during the INIT call,
	 * websocket connection creation or network
	*/
	override onError(error: HMSException)
}
```

Please note that `hmsSDK.leave()` should be called while navigating back from the preview screen to cleanup the websockets that are being open.

## How to know the type and source of Track

`HMSTrack` contain a field called `source` which denotes the source of the Track. `source` can have the following values - `regular` \(normal\), `screen` \(for screenshare\)and `plugin` \(for plugins\)

To know the type of track, check the value of `type` which would be one of the enum values - `AUDIO` or `VIDEO`

## Join room

Use the `HMSConfig` and `HMSUpdateListener` instances to call `join` method on the instance of `HMSSDK` created above.

Once `Join` succeeds, all the callbacks keep coming on every change in the room and the app can react accordingly

```java
hmsSDK.join(hmsConfig, hmsUpdateListener) // to join a room
```

## Leave room

Call the `leave` method on the `HMSSDK` instance

```java
hmsSDK.leave() // to leave a room
```

## Get peers/tracks data

`HMSSDK` has other methods which the client app can use to get more info about the `Room` , `Peer` and `Tracks`

```java
    fun join(config: HMSConfig, hmsUpdateListener: HMSUpdateListener) {
        // to join a Room
    }

    fun leave() {
        // to leave a Room
    }

    fun getLocalPeer(): HMSPeer {
        // Returns the local peer, which contains the local tracks
    }

    fun getRemotePeers(): List<HMSPeer> {
        // Returns a list of all the remote peers present in the room currently
    }

    fun getPeers(): List<HMSPeer> {
        // Returns a list of all the peers present in the room currently
    }

    fun sendMessage(type: String, message: String) {
        // used to send message to all other peers via broadcast
    }

    fun addAudioObserver(observer: HMSAudioListener) {
        // add a observer to listen to Audio Level Info of all peers. This will be
        // called every second if set
    }

    fun removeAudioObserver() {
        // remove the audio level info observer
    }
```

## HMSTracks explained

`HMSTrack` is the super class of all the tracks that are used inside `HMSSDK` . Its hierarchy looks like this

-   `HMSTrack`
    -   `HMSAudioTrack`
        -   `HMSLocalAudioTrack`
        -   `HMSRemoteVideoTrack`
    -   `HMSVideoTrack`
        -   `HMSLocalVideoTrack`
        -   `HMSRemoteVideoTrack`

```java
    class HMSTrack {
        val trackId: String // This is the id of a given track
        val type: HMSTrackType // One of AUDIO or VIDEO
        var source: String // This denotes whether the given track is a `regular`, `screen` or `plugin` type
        var description: String // This can be set by client app while creating a HMSTrack. Default value is empty
        var isMute: Boolean // This denotes where the current track is mute or not
    }

    class HMSLocalAudioTrack {
        var volume: Double // Volume of the current Track
        val hmsAudioTrackSettings: HMSAudioTrackSettings // Settings of the given Audio Track
        fun setMute(isMute: Boolean) // to mute or unmute the local audio track
        fun setSettings(newSettings: HMSAudioTrackSettings) // Application can use this to change settings of the audio track.
    }

    class HMSRemoteAudioTrack {
        var isPlaybackAllowed: Boolean // Is local playback allowed of this track or not

        fun setVolume(value: Double) // method to set the playback volume of remote audio track
    }

    class HMSVideoTrack {
        fun addSink(sink: VideoSink) // Call this when app needs to render a track on screen
        fun removeSink(sink: VideoSink) // Call this when app no longer needs to rebder
    }

    class HMSLocalVideoTrack {
        fun setMute(isMute: Boolean) // to mute or unmute the local video track
        fun setSettings(newSettings: HMSVideoTrackSettings) // to set new settings
        fun switchCamera() // To switch camera
        fun switchCamera(deviceId: String) // to change to a particular camera
    }

    class HMSRemoteVideoTrack {
        var isPlaybackAllowed: Boolean // to set or get if local playback is allowed for the remote video track
    }

    enum class HMSTrackType {
        AUDIO, // Denotes AUDIO track
        VIDEO  // Denotes VIDEO track
    }

```