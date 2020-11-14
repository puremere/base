
var myAudio = $("#song")[0];
document.getElementById("song").loop = true;
var isPlaying = false;

function togglePlay() {
    if (isPlaying) {
        myAudio.pause();
    } else {
        myAudio.play();
    }
};
myAudio.onplaying = function () {
    isPlaying = true;
};
myAudio.onpause = function () {
    isPlaying = false;
};

function waitTenSec() {
    setTimeout(function () {
        if ($('.callingSection').css('display') == 'block') {
            togglePlay();
            $(".callingSection").hide();
        }
       
    }, 15000);
}





let silence = () => {
    let ctx = new AudioContext(), oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
}

let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
}

//let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
let blackSilence = (...args) => new MediaStream([black(...args), silence()]);

var WebRtcDemo = WebRtcDemo || {};

// todo:
//  cleanup: proper module loading
//  cleanup: promises to clear up some of the async chaining
//  feature: multiple chat partners

WebRtcDemo.App = (function (viewModel, connectionManager) {
    var   _hub,
        _geustStream = "0",
        _slaveNumber = 1,
        _streamType = 'blank',
        _IAMDone,
        _partnerID,
        _connect = function (username, onSuccess, onFailure) {
            // Set Up SignalR Signaler

            var hub = $.connection.chatHub;
            hub.client.SetDefaultStream = function (index) {

            };
            hub.client.setMessage = function (message, connectionID, name) {
                    if (connectionID == viewModel.MyConnectionId()) {
                        var ul = $(".messages ul");
                        const li = document.createElement('li');
                        li.className = 'sent';
                        li.innerHTML = `<p>` + name +": " + message + `</p> `;
                        // var li = ' <li class="sent"> <img src = "http://emilcarlsson.se/assets/mikeross.png" alt = "" /> </li >';
                        ul.append(li);

                    }
                    else {
                        var ul = $(".messages ul");
                        const li = document.createElement('li');
                        li.className = 'replies';
                        li.innerHTML = `<p>` + name + ": " + message + `</p> `;
                        // var li = ' <li class="sent"> <img src = "http://emilcarlsson.se/assets/mikeross.png" alt = "" /> </li >';
                        ul.append(li);
                        togglePlay();

                    }
            };
            hub.client.callEveryOne = function (connectionID) {
                console.log("i am called");
                
                if (false) {
                    hub.server.resPonseToCallEveryOne(connectionID);
                    console.log("i have stream are you ready")
                }
                else {
                    console.log("i am buisy")
                }
            };
            hub.client.areYouStillThere = function (responser) {
                if (_IAMDone != true) {
                    _IAMDone = true;
                  
                    console.log(responser);
                    console.log("i am waiting please send stream");

                    hub.server.streamRequest(responser);
                   
                }
            };
            hub.client.updateUserList = function (userList) {

                viewModel.setUsers(userList);
            };
            hub.client.streamRequest = function (connectionId, reason) {
                console.log("calling user");
                _RequestedStream = 'blank';
                _hub.server.callUser(connectionId, "");
                alertify.success(reason);
            };
            // Hub Callback: Incoming Call
            hub.client.incomingCall = function (callingUser) {
                console.log('تماس ورودی از طرف: ' + JSON.stringify(callingUser));
                _partnerID = callingUser.ConnectionId;
                hub.server.answerCall(true, callingUser.ConnectionId);
                viewModel.Mode('incall');

                //// Ask if we want to talk
                //alertify.confirm(callingUser.Username + ' منتظر شماست، آیا به گفتمان می پیوندید ؟', function (e) {
                //    if (e) {
                //        // I want to chat
                //        hub.server.answerCall(true, callingUser.ConnectionId);

                //        // So lets go into call mode on the UI
                //        viewModel.Mode('incall');
                //    } else {
                //        // Go away, I don't want to chat with you
                //        hub.server.answerCall(false, callingUser.ConnectionId);
                //    }
                //});
            };

            // Hub Callback: Call Accepted
            hub.client.callAccepted = function (acceptingUser) {

                console.log('پذیرفته شدن تماس از طرف : ' + JSON.stringify(acceptingUser) + '.  ');

                connectionManager.sendSignal(acceptingUser.ConnectionId, _RequestedStream);
                viewModel.guestConnectionId(acceptingUser.ConnectionId);
                connectionManager.initiateOffer(acceptingUser.ConnectionId, [_geustStream, _geustStream2], "1");
                //connectionManager.initiateOffer(acceptingUser.ConnectionId, _mediaStream);

                // Set UI into call mode
                viewModel.Mode('incall');
            };

            // Hub Callback: Call Declined
            hub.client.callDeclined = function (decliningConnectionId, reason) {
                console.log('رد تماس از طرف: ' + decliningConnectionId);

                // Let the user know that the callee declined to talk
                alertify.error(reason);

                // Back to an idle UI
                viewModel.Mode('idle');
            };

            // Hub Callback: Call Ended
            hub.client.callEnded = function (connectionId, reason) {
                console.log('تماس با ' + connectionId + ' پایان یافت: ' + reason);

                // Let the user know why the server says the call is over
                //الرت نمیده
               // alertify.error(reason);

                // Close the WebRTC connection
                connectionManager.closeConnection(connectionId);
                //_geustStream = "0";
                $(".hangup").css("display", "none");
                // Set the UI back into idle mode
                viewModel.Mode('idle');
            };

            // Hub Callback: Update User List
            hub.client.changeStream = function (stream, acceptingUser) {
                console.log(stream);
                console.log(acceptingUser.ConnectionId);
               
                if (stream == 'video') {
                    connectionManager.changeTrack([_mediaStream], acceptingUser.ConnectionId);
                }
                else if (stream == 'blank') {
                    connectionManager.changeTrack([blackSilence()], acceptingUser.ConnectionId);
                }
                
               
            };
            //hub.client.HideYourVideo = function (index) {
            //    if (_slaveNumber > 1) {
            //        var srt = '.video.partner' + index;
            //        console.log(srt);
            //        var videoToHide = document.querySelector(srt);
            //        videoToHide.style.display = "none";
            //        _slaveNumber = _slaveNumber - 1;
                 
            //        if (_slaveNumber == 1) {
            //            $(".master").css("height", "100%");
            //            $(".slave").css("width", "30%");
            //            $(".slave").css("height", "30%");
            //            $(".slave").css("position", "absolute");
            //        }
            //        else if (_slaveNumber == 2) {
            //            $(".master").css("height", "50%");
            //            $(".slave").css("width", "50%");
            //            $(".slave").css("height", "50%");
            //            $(".slave").css("position", "relative");
            //            $(".slave video").css("object-fit", "cover");
            //        }
            //    }
                

            //};
            //hub.client.ShowYourVideo = function (index) {
            //    if (_slaveNumber <3) {
            //        var srt = '.video.partner' + index;
            //        console.log(srt);
            //        var videoToHide = document.querySelector(srt);
            //        videoToHide.style.display = "block";
            //        _slaveNumber = _slaveNumber + 1;
                  
            //        if (_slaveNumber == 2) {
            //            $(".master").css("height", "50%");
            //            $(".slave").css("width", "50%");
            //            $(".slave").css("height", "50%");
            //            $(".slave").css("position", "relative");
            //            $(".slave video").css("object-fit", "cover");

            //        }
            //        else if (_slaveNumber == 3) {
            //            $(".master").css("height", "50%");
            //            $(".master").css("width", "50%");
            //            $(".slave").css("width", "50%");
            //            $(".slave").css("height", "50%");
            //            $(".slave").css("position", "relative");
            //            $(".slave video").css("object-fit", "cover");

            //        }
            //    }
                
            //};
            

            // Hub Callback: WebRTC Signal Received
            hub.client.receiveSignal = function (callingUser, data ) {

                connectionManager.newSignal(callingUser.ConnectionId, data);
            };
            $.support.cors = true;
            $.connection.hub.url = '/signalr/hubs';
            $.connection.hub.start()
                .done(function () {
                    //alert('connected to SignalR hub... connection id: ' + _hub.connection.id);

                    // Tell the hub what our username is
                    console.log(viewModel.Groupname());
                    console.log(username);
                    hub.server.join(viewModel.Groupname(),username ,'client');
                    $("#chatname").text(username)
                    if (onSuccess) {
                        onSuccess(hub);
                    }
                })
                .fail(function (event) {

                    if (onFailure) {
                        onFailure(event);
                    }
                });


            // Setup client SignalR operations
            _setupHubCallbacks(hub);

            _hub = hub;
        },

     
        _start = function (hub, type) {
            console.log("start-" + type);
            // Show warning if WebRTC support is not detected
            if (webrtcDetectedBrowser == null) {
                console.log('مرورگر خود را به روزرسانی کنید');
                $('.browser-warning').show();
            }

            // Then proceed to the next step, gathering username
            _getUsername(type);
        },

        _getUsername = function (type) {
            console.log("getusername-" + type);
            alertify.prompt(" نام شما ؟", function (e, username) {
                if (e == false || username == '') {
                    //username = 'کاربر ' + Math.floor((Math.random() * 10000) + 1);
                    alertify.success('جهت اتصال باید نام کلاس را وارد کنید');
                }
                else {
                    _startSession(username);
                }

                // proceed to next step, get media access and start up our connection
               
            }, '');
        },

        _startSession = function (username) {
           
            // Set the selected username in the UI
            viewModel.Username(username);
            viewModel.Loading(true); // Turn on the loading indicator
            $('.instructions').hide();
            //var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            //if (!isMobile) {
               
            //    navigator.mediaDevices.getDisplayMedia({
            //        video: {
            //            cursor: "always"
            //        },
            //        audio: true
            //    }).then(

            //        stream => {
            //            console.log("screen is awesom");
            //            var videoScreen = document.querySelector('.video.screen');
            //            _screenStream = stream;


            //           // attachMediaStream(videoScreen, _screenStream);

            //        },
            //        error => {
            //            console.log("Unable to acquire screen capture", error);
            //            viewModel.Loading(false);
            //        });

            //}
            //else {
            //    $('.video.screen').css("display", "none");
            //};
            
           
            //getUserMedia(
            //    {
            //        // Permissions to request
            //        video: {
            //            facingMode: "environment",
                       
            //        },
            //        audio: true,
            //    },
            //    function (stream) { // succcess callback gives us a media stream
                    
            //        videoElement.srcObject = stream;
            //        _mediaStream = stream;
            //    },
            //    function (error) { // error callback
            //        alertify.alert('<h4>Failed to get hardware access!</h4> Do you have another browser type open and using your cam/mic?<br/><br/>You were not connected to the server, because I didn\'t code to make browsers without media access work well. <br/><br/>Actual Error: ' + JSON.stringify(error));
            //        viewModel.Loading(false);
            //    }
            //);
          
            $('.instructions').hide();
            $(".audio.mine").css("display", "none");
            $(".mineholder").css("display", "inline-block");



            // Now we have everything we need for interaction, so fire up SignalR
         
            _connect(username, function (hub) {
               
                // tell the viewmodel our conn id, so we can be treated like the special person we are.
                viewModel.MyConnectionId(hub.connection.id);

                // Initialize our client signal manager, giving it a signaler (the SignalR hub) and some callbacks
                // alert('initializing connection manager');
                connectionManager.initialize(hub.server, _callbacks.onReadyForStream, _callbacks.onStreamAdded, _callbacks.onStreamRemoved, _callbacks.onTrackAdded);

                // Store off the stream reference so we can share it later
               // _mediaStream = stream;

                // Load the stream into a video element so it starts playing in the UI
                console.log('playing my local video feed');


                



                // Hook up the UI
                _attachUiHandlers();

                viewModel.Loading(false);

            }, function (event) {
                alertify.alert('<h4>Failed SignalR Connection</h4> We were not able to connect you to the signaling server.<br/><br/>Error: ' + JSON.stringify(event));
                viewModel.Loading(false);
            });
     

        },

        _attachUiHandlers = function () {

            var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                $(".slave").click(function () {
                    if (_slaveNumber > 1) {
                       
                        if ($(this).width() != screen.width || screen.height -  $(this).height() + $(".container-fluid").height() > 100 ) {

                            $(this).css("width", "100%");
                            $(this).css("height", "100%");
                            $(this).css("position", "absolute");
                            $(this).css("z-index", "9");
                            $(this).css("overflow", "none");
                            $(".slave video").css("object-fit", "contain");
                            
                        }
                        else {
                            $(this).css("width", "50%");
                            $(this).css("height", "50%");
                            $(this).css("position", "relative");
                            $(this).css("z-index", "1");
                            $(this).css("overflow", "hidden");
                            $(".slave video").css("object-fit", "cover");
                           
                        }
                    }
                })
                $(".master").click(function () {
                  
                    if (_slaveNumber == 1) {
                     
                        if ($(this).width() != screen.width) {

                            $(this).css("position", "relative");
                            $(this).css("width", "100%");
                            $(this).css("z-index", "0");
                         
                        }
                        else {
                            $(this).css("position", "absolute");
                            $(this).css("width", "101%");
                            $(this).css("z-index", "9");
                           

                        }
                    }
                    else if (_slaveNumber == 2) {
                        if ($(this).width() != screen.width || screen.height - $(this).height() + $(".container-fluid").height() > 100) {

                            $(this).css("width", "100%");
                            $(this).css("height", "100%");
                            $(this).css("position", "absolute");
                            $(this).css("z-index", "9");
                            $(this).css("overflow", "none");
                            $(this).css("object-fit", "scale-down");

                        }
                        else {
                            $(this).css("width", "100%");
                            $(this).css("height", "50%");
                            $(this).css("position", "relative");
                            $(this).css("z-index", "1");
                            $(this).css("overflow", "hidden");
                            $(this).css("object-fit", "cover");

                        }
                    }
                });
            }

            $(".mycamera").click(function () {
                var x = document.getElementById("cameraSection");
                if (x.style.display === "none") {
                    $("#cameraSection").slideDown();
                    // x.style.display = "block";
                } else {
                    $("#cameraSection").slideUp();
                    // x.style.display = "none";
                }
            });
            $(".chat").click(function () {
                var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                    var width = $("#chatHolder").width();
                    if (width == 0) {
                        $(".content").css("display", "block");
                        $("#vidoeHolder").animate({
                            width: '0%'
                        });
                        $("#chatHolder").animate({
                            width: '100%'
                        })
                    }
                    else {
                        $(".content").css("display", "none");
                        $("#vidoeHolder").animate({
                            width: '100%'
                        });
                        $("#chatHolder").animate({
                            width: '0%'
                        })
                    }
                   
                }
                else {
                    var width = $("#chatHolder").width();
                    if (width == 0) {
                        $("#vidoeHolder").animate({
                            width: '50%'
                        });
                        $("#chatHolder").animate({
                            width: '50%'
                        })
                    }
                    else {
                        $("#vidoeHolder").animate({
                            width: '100%'
                        });
                        $("#chatHolder").animate({
                            width: '0%'
                        })
                    }
                   
                }
               
               
            });
            // Add click handler to users in the "Users" pane
            $('.user').live('click', function () {
                // Find the target user's SignalR client id
                var targetConnectionId = $(this).attr('data-cid');

                // Make sure we are in a state where we can make a call
                //if (viewModel.Mode() !== 'idle') {
                //    alertify.error('Sorry, you are already in a call.  Conferencing is not yet implemented.');
                //    return;
                //}

                // Then make sure we aren't calling ourselves.
                if (targetConnectionId != viewModel.MyConnectionId()) {
                    // Initiate a call
                    _hub.server.callUser(targetConnectionId);// 

                    // UI in calling mode
                    viewModel.Mode('calling');
                } else {
                    alertify.error("Ah, nope.  Can't call yourself.");
                }
            });

            // Add handler for the hangup button
            $('.hangup').click(function () {
                $(".master").css("height", "100%");
                //$(".slave").css("width", "30%");
                //$(".slave").css("height", "30%");
                //$(".slave").css("position", "absolute");
                _IAMDone = "";
                _geustStream = "0";
                // Only allow hangup if we are not idle
                $(".requst").css("display","inline-block")
                $(".hangup").css("display","none")
                if (viewModel.Mode() != 'idle') {
                    _hub.server.hangUp("");
                    connectionManager.closeAllConnections();
                    viewModel.Mode('idle');
                }
            });
            $('.requstTasviri').click(function () {
                _mediaStream = null;
                getUserMedia(
                    {
                        video: true,
                        audio: true,
                    },
                    function (stream) { // succcess callback gives us a media stream

                        let AudioTrack = stream.getAudioTracks()[0];
                        let videoTrack = stream.getVideoTracks()[0];
                        _mediaStream = new MediaStream([videoTrack, AudioTrack]);
                        let videoElement = document.querySelector('.video.mine');
                        attachMediaStream(videoElement, _mediaStream);

                        $(".master").css("height", "100%");
                        //$(".slave").css("width", "30%");
                        //$(".slave").css("height", "30%");
                        //$(".slave").css("position", "absolute");
                        _IAMDone = "";

                        _hub.server.hangUp("");
                        connectionManager.closeAllConnections(viewModel.guestConnectionId());
                        _hub.server.callEveryOne(viewModel.guestConnectionId());
                        $(".callingSection").show();
                        togglePlay();
                        alertify.success("درخواست شما ارسال شد");
                        waitTenSec();
                    },
                    function (error) { // error callback
                        alertify.alert('جهت تماس لطفا با درخواست دسترسی موافقت بفرمایید ');
                        viewModel.Loading(false);
                    }
                );

              
            });
            $('.requstSoti').click(function () {
                _mediaStream = null;
                getUserMedia(
                    {
                        video: true,
                        audio: true,
                    },
                    function (stream) { // succcess callback gives us a media stream

                        let AudioTrack = stream.getAudioTracks()[0];
                        let videoTrack = stream.getVideoTracks()[0];
                        _mediaStream = new MediaStream([black(), AudioTrack]); 
                        let videoElement = document.querySelector('.video.mine');
                        attachMediaStream(videoElement, _mediaStream);
                       
                        $(".master").css("height", "100%");

                        //$(".slave").css("width", "30%");
                        //$(".slave").css("height", "30%");
                        //$(".slave").css("position", "absolute");

                        _IAMDone = "";
                        _hub.server.hangUp("");
                        connectionManager.closeAllConnections(viewModel.guestConnectionId());
                        _hub.server.callEveryOne(viewModel.guestConnectionId());
                        $(".callingSection").show();
                        togglePlay();
                        alertify.success("درخواست شما ارسال شد");
                        waitTenSec();
                    },
                    function (error) { // error callback
                        alertify.alert('جهت تماس لطفا با درخواست دسترسی موافقت بفرمایید ');
                        viewModel.Loading(false);
                    }
                );


               

            });
            $(".submit").click(function () {
                var message = $("#chatMessage").val();
                _hub.server.sendMessage(message);
            })

        },

        _setName = function (name) {
            viewModel.Groupname(name);
        },
        _setupHubCallbacks = function (hub) {


        },

        // Connection Manager Callbacks
        _callbacks = {
            
            onReadyForStream: function (connection) {
              
                
                var st1 = new MediaStream();
                var st2 = new MediaStream();

                if (_streamType == 'video') {
                    _mediaStream.getTracks().forEach(function (track) {

                        connection.addTrack(track, st1);
                    });
                }
                else {
                   
                    blackSilence().getTracks().forEach(function (track) {

                        connection.addTrack(track, st1);
                    });
                }

                
                console.log("adding media stream");
                //connection.addStream(_finalStream);
               
                
            },
            onStreamAdded: function (connection, event) {
                console.log('binding remote stream to the partner window');


                $(".partnerholder").css("display", "inline-block");
                $(".requst").css("display", "inline-block");
                $(".hangup").css("display", "inline-block");
                
            


            },
            onTrackAdded: function (connection, event) {
               // alertify.success("ontrack   "+_geustStream);
                togglePlay();
                $(".callingSection").hide();
                var otherVideo = document.querySelector('.video.partner');
                var st1 = new MediaStream();
                if (event.streams[0].getVideoTracks() != null) {
                    if (event.streams[0].getVideoTracks()[0] != null) {
                        console.log("1 has video")
                        st1.addTrack(event.streams[0].getVideoTracks()[0]);

                    }

                }
                if (event.streams[0].getVideoTracks() != null) {
                    if (event.streams[0].getAudioTracks()[0] != null) {
                        console.log("1 has audio")
                        st1.addTrack(event.streams[0].getAudioTracks()[0]);
                    }
                }
                attachMediaStream(otherVideo, st1);
                console.log("ontrack fired!");

            
               
                


            },
            onStreamRemoved: function (connection, streamId) {
                // todo: proper stream removal.  right now we are only set up for one-on-one which is why this works.
                console.log('removing remote stream from partner window');

                // Clear out the partner window
                var otherVideo = document.querySelector('.video.partner');
                otherVideo.src = '';
            }
        };

    return {
        start: _start, // Starts the UI process
        getStream: function () { // Temp hack for the connection manager to reach back in here for a stream
            return _mediaStream;
        },
        setName : _setName
    };
})(WebRtcDemo.ViewModel, WebRtcDemo.ConnectionManager);

// Kick off the app
WebRtcDemo.App.start();