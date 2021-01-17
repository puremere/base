
alertify.defaults = {
    // dialogs defaults
    autoReset: true,
    basic: false,
    closable: true,
    closableByDimmer: true,
    invokeOnCloseOff: false,
    frameless: false,
    defaultFocusOff: false,
    maintainFocus: true, // <== global default not per instance, applies to all dialogs
    maximizable: true,
    modal: true,
    movable: true,
    moveBounded: false,
    overflow: true,
    padding: true,
    pinnable: true,
    pinned: true,
    preventBodyShift: false, // <== global default not per instance, applies to all dialogs
    resizable: true,
    startMaximized: false,
    transition: 'pulse',
    transitionOff: false,
    tabbable: 'button:not(:disabled):not(.ajs-reset),[href]:not(:disabled):not(.ajs-reset),input:not(:disabled):not(.ajs-reset),select:not(:disabled):not(.ajs-reset),textarea:not(:disabled):not(.ajs-reset),[tabindex]:not([tabindex^="-"]):not(:disabled):not(.ajs-reset)',  // <== global default not per instance, applies to all dialogs

    // notifier defaults
    notifier: {
        // auto-dismiss wait time (in seconds)  
        delay: 5,
        // default position
        position: 'bottom-right',
        // adds a close button to notifier messages
        closeButton: false,
        // provides the ability to rename notifier classes
        classes: {
            base: 'alertify-notifier',
            prefix: 'ajs-',
            message: 'ajs-message',
            top: 'ajs-top',
            right: 'ajs-right',
            bottom: 'ajs-bottom',
            left: 'ajs-left',
            center: 'ajs-center',
            visible: 'ajs-visible',
            hidden: 'ajs-hidden',
            close: 'ajs-close'
        }
    },

    // language resources 
    glossary: {
        // dialogs default title
        title: 'AlertifyJS',
        // ok button text
        ok: 'تایید',
        // cancel button text
        cancel: 'لغو'
    },

    // theme settings
    theme: {
        // class name attached to prompt dialog input textbox.
        input: 'ajs-input',
        // class name attached to ok button
        ok: 'ajs-ok',
        // class name attached to cancel button 
        cancel: 'ajs-cancel'
    },
    // global hooks
    hooks: {
        // invoked before initializing any dialog
        preinit: function (instance) { },
        // invoked after initializing any dialog
        postinit: function (instance) { },
    },
};



var myAudio = $("#song")[0];

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


var height = 240; // parseInt(option_height.value),
var width = 240; // parseInt(option_width.value),
var framerate = 10; // parseInt(option_framerate.value),
var audiobitrate = 22050; // 44100; 11025 parseInt(option_bitrate.value),
var videoElement = document.querySelector('.video.mine');
var final = document.querySelector('#main0');
var audioSelect = document.querySelector('select#audioSource');
var videoSelect = document.querySelector('select#videoSource');
var _mediaStream;
audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

//getStream().then(getDevices).then(gotDevices);
//getaudio()
//getStream();
function getDevices() {
    // AFAICT in Safari this only gets default devices until gUM is called :/
    return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
    window.deviceInfos = deviceInfos; // make available to console
    console.log('Available input and output devices:', deviceInfos);
    for (const deviceInfo of deviceInfos) {
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
            audioSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }
}

function getStream() {
    alert('version1')
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
        audio: {
            sampleRate: audiobitrate,
            echoCancellation: true,
            deviceId: audioSource ? { exact: audioSource } : undefined
        },
       
        video: {
            //width: { min: 100, ideal: width, max: 1920 },
            //height: { min: 100, ideal: height, max: 1080 },
            width: { min: 100, ideal: 240, max: 100 },
            height: {  min: 100, ideal: 240, max: 100 },
            frameRate: { ideal: framerate },
            deviceId: videoSource ? { exact: videoSource } : undefined
        }
    };
    return navigator.mediaDevices.getUserMedia(constraints).
        then(gotStream).catch(handleError);
}

function getaudio() {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioSelect.value;

    const constraints = {
        audio: true,
        video: false
    };
    return navigator.mediaDevices.getUserMedia(constraints).
        then(gotStream).catch(handleError);
}

function gotStream(stream) {
    _mediaStream = stream;
    //  window.stream = stream; // make stream available to console
    audioSelect.selectedIndex = [...audioSelect.options].
        findIndex(option => option.text === stream.getAudioTracks()[0].label);
    videoSelect.selectedIndex = [...videoSelect.options].
        findIndex(option => option.text === stream.getVideoTracks()[0].label);
    videoElement.srcObject = stream;
    //final.srcObject = stream;
}

function handleError(error) {
    console.error('Error: ', error);
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

let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
//let blackSilence = (...args) => new MediaStream([black(...args)]);

var WebRtcDemo = WebRtcDemo || {};

// todo:
//  cleanup: proper module loading
//  cleanup: promises to clear up some of the async chaining
//  feature: multiple chat partners

WebRtcDemo.App = (function (viewModel, connectionManager) {
    var
        _screenStream,
        _hub,
        STes = [],
        SteamToGo = [],
        SteamUsedID = ["1", "0", "0"],
        _index,
        _RequestedStream = 'blank',
        _connectionManager = connectionManager,
        _indexMustBeChange,
        _requestedType ,
        _noMoreConnection = "",
        _relayProcess,
        _Attachment = {},
        mediaRecorder;
        _connect = function (username, onSuccess, onFailure) {
            // Set Up SignalR Signaler

            var hub = $.connection.chatHub;
            hub.client.SetDefaultStream = function (index) {
                _index = index;
            };
            hub.client.alertID = function (count) {

            };
            hub.client.closeAll = function (id) {

                viewmodel.mode('idle');
                connectionmanager.closeallconnections();
                //alert("aaaaaa")
            };
            hub.client.updateUserList = function (userList) {

                viewModel.setUsers(userList);
            };
            hub.client.setMessage = function (message, connectionID, name, type, progressID) {

             
                if (connectionID == viewModel.MyConnectionId()) {
                    //var ul = $(".messages ul");
                    //const li = document.createElement('li');
                    //li.className = 'sent';
                    //li.innerHTML = `<p>` + name + ": " + message + `</p> `;
                    //// var li = ' <li class="sent"> <img src = "http://emilcarlsson.se/assets/mikeross.png" alt = "" /> </li >';
                    //ul.append(li);

                }
                else {
                    var hasobject; // بفهمیم چنتا ال آی باید به لیست اضافه کنیم
                    var hastext;
                    var li; // مال متن همراه با آبجکت یا بدون آبجکت 
                    var li2;// مال آبجکت
                    var ul = $(".messages ul"); // لیست اصلی پیام ها - سیستم اینجوری کار میکنه که دوتالیست نداریم یه لیست داریم برای داخل و خارج که لیست با مستر خودش هیدن میشه
                   
                    if (message.includes('***')) {

                        let msg = message.split('***')[0];
                        url = message.split('***')[1];
                      
                        hastext = true;
                        li = document.createElement('li');
                        li2 = document.createElement('li');
                        li.className = 'replies ' + connectionID;
                        li2.className = 'replies ' + connectionID;
                        li.innerHTML = `<p>` + msg + `</p> `;
                       
                    }
                    else {
                        hastext = false;
                        url = message   // این یو آر ال میتواند هم یور ال هر آبجکتی باشد هم تکست آبحکت تکست
                        li = document.createElement('li');
                        li.className = 'replies ' + connectionID;
                        li.innerHTML = `<p>` + url + `</p> `;
                    }

                   
                    var specificLi = $("#" + connectionID).text();
                    let ismainListempty;  // مشخص میکند که آیا لیست اصلی خالی است یا پر حالت یک خالی حالت دو پر  
                    if (specificLi != '') {
                        ismainListempty = 2
                    }
                    else {
                        ismainListempty = 1
                    }

                    var bool = $('#backButt').css('display') == 'block';
                    var bool2 = $('#hiddeninput').val() == connectionID;
                    var isBackIsHitInItem;// اگر توی یه آیتم باشی 2 و اگه بک زده باشی 1 
                    if (bool && bool2) {
                        isBackIsHitInItem = 2
                    }
                    else {
                        isBackIsHitInItem = 1
                    }


                   
                    if (type == "image") {
                        console.log(url);
                        li2 = document.createElement('li');
                        li2.className = 'replies ' + connectionID;
                       
                        li2.innerHTML = `<div  style="position:relative;object-fit:scale-down;float:left;border-radius:0;border: 2px solid white;border-radius: 5px;"> <i id="` + url +`" style="position: absolute; top: 50%; left: 50%;  font-size: 20px;cursor:pointer; transform: translate(-50%, -50%);" class="fal fa-download" onclick="downlodIMG(this)"></i><img  style="min-width: 150px;max-width: 150px;border-radius:5px;margin: 0;"  src="/Files/0`+url+`"/></div>`;// `<img style="width:150px; float:left; border-radius:0" src="/Files/` + url + `" />`;
                        //li2.innerHTML = `<div style="position:relative;object-fit:scale-down;float:left;border-radius:0;border: 2px solid white;border-radius: 5px;"><span style="display:none">` + url + `</span> <i style="position: absolute; top: 50%; left: 50%;  font-size: 30px; transform: translate(-50%, -50%);" class="fal fa-download"></i><img style="min-width: 150px;max-width: 150px;border-radius:5px;margin: 0;"  src="/Files/0` + url + `"/></div>`;// `<img style="width:150px; float:left; border-radius:0" src="/Files/` + url + `" />`;
                        hasobject = true;
                       

                       
                    }
                    
                    else if (type == "audio") {
                        li2 = document.createElement('li');
                        li2.className = 'replies ' + connectionID;
                        li2.innerHTML = `<div  style="position:relative;object-fit:scale-down;float:left;border-radius:0;border: 2px solid white;border-radius: 5px;"> <i id="` + url + `" style="z-index:99; position: absolute; top: 50%; left: 50%;  font-size: 20px;cursor:pointer; transform: translate(-50%, -50%);" class="fal fa-download" onclick="downlodIMG(this)"></i><audio controls='' style="float:right"><source src=""></source></audio></div>` ;
                        hasobject = true;
                    }
                    else if (type == "file") {
                        li2 = document.createElement('li');
                        li2.className = 'replies ' + connectionID;
                        li2.innerHTML = `<div class='fileUploadParent  '  style=""><div class="row" style="margin:0"><img  src="/images/fileicon.png" /><span  >` + url + `</span></div></div>` + `<i id="` + url +`" class="fa fa-download" style="font-size: 14px;position: absolute;bottom: 20px;right: 10px;color: #1c1c1c;cursor:pointer " onclick = downlodFile(this)></i>`;
                        hasobject = true;
                    }
                    else {
                        hastext = true;
                    }




                    console.log(hasobject);
                    console.log(hastext);
                  
                    if (ismainListempty == 2  ) {   

                        var preview = $("#" + connectionID).find(".preview");
                      
                        if (isBackIsHitInItem == 2)// اینجوری لازم نیست مستر تغییر کنه و فقط آیتم داخل مستر تغییر میکنن
                        {
                            console.log("2")
                            display = 'block';
                            if (hasobject == true) {
                                li2.style.display = display;
                                ul.append(li2);
                            }
                            if (hastext == true) {
                                li.style.display = display;
                                ul.append(li);
                            }
                           
                            
                            
                            $("." + connectionID).css("display", "block");
                            $("#backButt").css("display", "block");
                            $(".num").css("display", "none");
                            $(this).find(".num").text('');
                            $(this).find(".num").css("display", "none");
                            $(".mainli").css("display", "none");
                            $(".message-input").css("display", "block")

                            var objDiv = document.getElementById("message");
                            var num = objDiv.scrollHeight;
                            objDiv.scrollTop = num

                        } else {   // مسترم باید تغییر کنه
                            console.log("1")
                            display = 'none';
                            if (hasobject == true) {
                                li2.style.display = display;
                                ul.append(li2);
                            }
                            if (hastext == true) {
                                li.style.display = display;
                                ul.append(li);
                            }
                            $('ul li').css("display", "none");
                            $(".mainli").css("display", "block");
                            var firstnum = $("#" + connectionID).find(".num");
                           
                            var numtext = firstnum.text();

                            if (numtext == '') {
                                num = 1;
                            }
                            else {
                                num = parseInt(numtext) + 1;
                            }

                            firstnum.text(num);
                            firstnum.css("display", "block");
                          

                        }
                        preview.text(url);
                        
                        
                      
                        
                       
                       
                    }
                    else {
                       
                        let display = "block";
                       
                        if (bool == true) {
                            display = "none";
                        }
                        
                      
                        const llii = document.createElement('li');
                        llii.className = 'replies mainli ' + connectionID;
                        llii.id = connectionID;
                        let bodystring =  `<span style="display:inline-block width=:100%; font-weight:600; float:right">  : ` + name + `</span><span class="preview" style:"display:inline-block">` + url + `</span>`;
                        llii.style.display = display;
                        llii.innerHTML = `<p onclick='mainliClicked(` + `"` + connectionID + `"` + `,` + `"` + name + `"` + `)'  class="main" >  ` + bodystring+`<span class="num" style="position:absolute;margin-right: 5px;right: 0;padding: 1px 8px;border-radius:50;border-radius: 50%;top: 5px;background: #4d4d4d;color: white;"></span></p> `  ;
                        // var li = ' <li class="sent"> <img src = "http://emilcarlsson.se/assets/mikeross.png" alt = "" /> </li >';

                        var ulInnerHtml = ul.html();
                        ul.html(llii)
                        ul.append(ulInnerHtml);


                        console.log(hasobject);
                        console.log(hastext);
                        if (hasobject == true) {
                            li2.style.display = "none";
                            ul.append(li2);
                        }
                        if (hastext == true) {
                            li.style.display = "none";
                            ul.append(li);
                        }
                        
                        var firstnum = $("#" + connectionID).find(".num");
                       
                        var numtext = firstnum.text();
                       
                        if (numtext == '') {
                            num = 1;
                        }
                        else {
                            num = parseInt(num) + 1;
                        }

                        firstnum.text(num);
                    }


                    var objDiv = document.getElementById("message");
                    objDiv.scrollTop = objDiv.scrollHeight;
                   
                    _hub.server.messageRcieved(connectionID, progressID);
                   
                    

                   

                    //togglePlay();

                }
            };
            hub.client.messageRecived = function (progressID) {
                var spg = $("#" + progressID).parent();
                let check = `<i class="fa fa-check" style=" font-size: 12px;position: absolute;bottom: 5px;left: 10px;color: white;"></i>`;
                spg.append(check);

            };
            // Hub Callback: Incoming Call
            hub.client.incomingCall = function (callingUser) {
                console.log('تماس ورودی از طرف: ' + JSON.stringify(callingUser));

                // Ask if we want to talk
                

                alertify.confirm(callingUser.Username + ' منتظر شماست، آیا به گفتمان می پیوندید ؟', function (e) {
                    if (e) {
                        // I want to chat
                        hub.server.answerCall(true, callingUser.ConnectionId);

                        // So lets go into call mode on the UI
                        viewModel.Mode('incall');
                    } else {
                        // Go away, I don't want to chat with you
                        hub.server.answerCall(false, callingUser.ConnectionId);
                    }
                });
            };

            // Hub Callback: Call Accepted
            hub.client.callAccepted = function (acceptingUser, isChnager, username) {
                _indexMustBeChange = isChnager;
                if (isChnager != "") {

                    _index = "1";
                }

                console.log('پذیرفته شدن تماس از طرف : ' + JSON.stringify(acceptingUser) + '.  ');
                if (username == 'relay') {
                    console.log("relay true");
                    _noMoreConnection = "true"; // بخش اضافه شدن کانکشن ها این باید
                }
                // Callee accepted our call, let's send them an offer with our video stream
                console.log(_requestedType);
                var bool;
                if (_requestedType == 0) {
                    bool = false;
                }
                else {
                    bool = true;
                }
                console.log(bool);
                getUserMedia(
                    {
                        // Permissions to request
                        video: bool,
                        audio: true,
                    },
                    function (stream) { // succcess callback gives us a media stream

                        $('.instructions').hide();

                        _mediaStream = stream;
                        _finalStream = stream;
                        var videoElement = document.querySelector('.video.mine');
                        attachMediaStream(videoElement, stream);
                        $(".audio.mine").css("display", "none");


                        viewModel.Loading(false);
                        SteamToGo[0] = _mediaStream;


                        // send signal moved to onclick

                        connectionManager.sendSignal(acceptingUser.ConnectionId, _RequestedStream);
                        connectionManager.initiateOffer(acceptingUser.ConnectionId, SteamToGo);
                        //connectionManager.initiateOffer(acceptingUser.ConnectionId, SteamToGo);


                        //mixer.frameInterval = 1;
                        //mixer.startDrawingFrames();

                        // Set UI into call mode
                        viewModel.Mode('incall');
                    },
                    function (error) { // error callback
                        alertify.alert('<h4>Failed to get hardware access!</h4> Do you have another browser type open and using your cam/mic?<br/><br/>You were not connected to the server, because I didn\'t code to make browsers without media access work well. <br/><br/>Actual Error: ' + JSON.stringify(error));
                        viewModel.Loading(false);
                    }
                );



               

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
                _noMoreConnection = "";
                // Let the user know why the server says the call is over
                alertify.error(reason);

                // Close the WebRTC connection
                connectionManager.closeConnection(connectionId);
                $("#" + connectionId).parent(".slave").remove();



                // Set the UI back into idle mode
                viewModel.Mode('idle');
            };
            hub.client.callEveryOne = function (connectionID, callEveryOne) {
                console.log("i am called");
                console.log(_noMoreConnection);

                if (_noMoreConnection == "") {


                    console.log(connectionID + "i have stream are you ready")
                    // _noMoreConnection = "true";
                    //console.log(_noMoreConnection);


                    // $(".player_audio").play()
                    console.log("player_audio is playing");
                    hub.server.resPonseToCallEveryOne(connectionID);

                }
                else {
                    console.log("i am buisy")
                }
            };

            hub.client.GetStreamRequest = function (connectionId, reason, username,type) {


                console.log("calling user");
                _requestedType = type;
                _RequestedStream = 'blank';
                togglePlay();
                var message = '';
                if (type == 0) {
                    message = 'شما یک تماس صوتی دارید، آیا میپذیرید؟'
                }
                else {
                    message = 'شما یک تماس تصویری دارید، آیا میپذیرید؟'

                }
                alertify.confirm('', message, function () {
                      _hub.server.callUser(connectionId, "");
                        alertify.success(reason);
                        togglePlay();
                }
                    , function () { togglePlay(); }).autoCancel(55).set('modal', false); ;
                //alertify.confirm( ' تماس ورودی آیا می پذیرید ؟', function (e) {
                //    if (e) {
                //        _hub.server.callUser(connectionId, "");
                //        alertify.success(reason);
                //        togglePlay();
                //    } else {
                //        // Go away, I don't want to chat with you
                //        //let user know you cant talk right now
                //        togglePlay();
                //        //hub.server.answerCall(false, callingUser.ConnectionId);
                //    }
                //});







            }

            hub.client.relayCallBack = function (callback) {

                _relayProcess = callback
                console.log(callback);
            }
            // Hub Callback: Update User List


            // Hub Callback: WebRTC Signal Received
            hub.client.receiveSignal = function (callingUser, data) {

                connectionManager.newSignal(callingUser.ConnectionId, data);
            };
            $.support.cors = true;
            $.connection.hub.url = '/signalr/hubs';
            $.connection.hub.start()
                .done(function () {
                    console.log('connected to SignalR hub... connection id: ' + _hub.connection.id);

                    // Tell the hub what our username is
                    hub.server.join(viewModel.Groupname(), username, 'admin');


                    if (onSuccess) {
                        onSuccess(hub);
                    }
                })
                .fail(function (event) {
                    console.log('connecting fail: ' + _hub.connection.id);
                    if (onFailure) {

                        //onFailure(event);
                    }
                });
            $.connection.hub.disconnected(function () {
                setTimeout(function () {
                    $.connection.hub.start().done(function () {
                        //alert('connected to SignalR hub... connection id: ' + _hub.connection.id);

                        // Tell the hub what our username is
                        console.log(viewModel.Groupname());
                        console.log(username);
                        hub.server.join(viewModel.Groupname(), username, 'client');
                        $("#chatname").text(username)
                        if (onSuccess) {
                            onSuccess(hub);
                        }
                    }).fail(function (event) {

                        if (onFailure) {
                            onFailure(event);
                        }
                    });
                    console.log("restart connection");
                }, 5000); // Restart connection after 5 seconds.
            });

            // Setup client SignalR operations
            _setupHubCallbacks(hub);

            _hub = hub;
        },

        _start = function (hub) {
            // Show warning if WebRTC support is not detected
            if (webrtcDetectedBrowser == null) {
                console.log('مرورگر خود را به روزرسانی کنید');
                $('.browser-warning').show();
            }

            // Then proceed to the next step, gathering username
            _getUsername();
        },

        _getUsername = function () {


            //alertify.prompt(" نام شما ؟", function (e, username) {
            //    if (e == false || username == '') {
            //        username = 'کاربر ' + Math.floor((Math.random() * 10000) + 1);
            //        alertify.success('شما به نام  نیاز دارید : ' + username);
            //    }

            //    // proceed to next step, get media access and start up our connection
            //    _startSession(username);

            //}, '');

            alertify.prompt(' ', 'نام شما ؟', ' '
                , function (evt, username) {
                    if (username != '') {
                        _startSession(username);
                    }
                    else {
                        username = 'کاربر ' + Math.floor((Math.random() * 10000) + 1);
                        alertify.success('شما به نام  نیاز دارید : ' + username);
                    }
                    
                }
                , function () {
                    alertify.error('جهت ارتباط لطفا مجددا اقدام کنید');
                });

            


        },

        _startSession = function (username) {

            // Set the selected username in the UI
            viewModel.Username(username);
            viewModel.Loading(true); // Turn on the loading indicator

            // Ask the user for permissions to access the webcam and mic
            //var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            //if (!isMobile) {
            //    navigator.mediaDevices.getDisplayMedia({
            //        video: {
            //            cursor: "always"
            //        },
            //        audio: true
            //    }).then(
            //        stream => {
            //            console.log("awesom");
            //            var videoScreen = document.querySelector('.video.screen');
            //            _screenStream = stream;


            //            attachMediaStream(videoScreen, _screenStream);
            //           // videoScreen.css("display", "block");
            //            _screenStream.addTrack(silence());
            //            STes["101010"] = _screenStream;
            //        },
            //        error => {
            //            console.log("Unable to acquire screen capture", error);
            //            viewModel.Loading(false);
            //        });

            //}




            $('.instructions').hide();

            // Now we have everything we need for interaction, so fire up SignalR
            _connect(username, function (hub) {
                // tell the viewmodel our conn id, so we can be treated like the special person we are.
                viewModel.MyConnectionId(hub.connection.id);

                // Initialize our client signal manager, giving it a signaler (the SignalR hub) and some callbacks
                // alert('initializing connection manager');
                connectionManager.initialize(hub.server, _callbacks.onReadyForStream, _callbacks.onStreamAdded, _callbacks.onTrackAdded, _callbacks.onStreamRemoved);

                // Store off the stream reference so we can share it later
                // _mediaStream = stream;
                STes["1"] = _mediaStream;

                _index = "1";
                // Load the stream into a video element so it starts playing in the UI
                // console.log('playing my local video feed');
                // var videoElement = document.querySelector('.video.mine');
                // attachMediaStream(videoElement, STes["1"]);

                // Hook up the UI
                _attachUiHandlers();

                viewModel.Loading(false);
            }, function (event) {
                alertify.alert('<h4>Failed SignalR Connection</h4> We were not able to connect you to the signaling server.<br/><br/>Error: ' + JSON.stringify(event));
                viewModel.Loading(false);
            });

           
        },

        _attachUiHandlers = function () {
            $(".mycamera").click(function () {
                var x = document.getElementById("cameraSection");
                if (x.style.display === "none") {
                    $("#cameraSection").slideDown();
                    // x.style.display = "block";
                } else {
                    $("#cameraSection").slideUp();
                    // x.style.display = "none";
                }
            })
            // Add click handler to users in the "Users" pane

            $(".transmit").click(function () {
                console.log(_noMoreConnection);
                if (_noMoreConnection == "") {
                    // _noMoreConnection = "true";
                    alertify.success("انتقال تصویر فعال شد")
                    console.log(viewModel.Groupname());
                    _hub.server.sendRelay(viewModel.Groupname());
                }
                else {
                    _noMoreConnection = "";
                    _hub.server.killRelay(_relayProcess);
                    alertify.error("انتقال تصویر غیر فعال شد");
                    _hub.server.deleteRelayFromList();// 

                }

            });
            $("#refresh").click(function () {
                _hub.server.refreshUser();// 
            });
            $('.user p.screen').live('click', function () {

                var targetConnectionId = $(this).attr('data-cid');
                if (targetConnectionId != viewModel.MyConnectionId()) {
                    _RequestedStream = 'video';
                    connectionManager.sendSignal(targetConnectionId, _RequestedStream);

                    //_hub.server.hangUp(targetConnectionId);
                    //// _hub.revoke('HangUp', targetCo/
                    //connectionManager.closeConnection(targetConnectionId);
                    //viewModel.Mode('idle');

                    //_RequestedStream = 'screen';
                    //// connectionManager.sendSignal(targetConnectionId, _RequestedStream);
                    //_hub.server.callUser(targetConnectionId, "");// 
                    //console.log("callUser", "");
                    //// UI in calling mode
                    //viewModel.Mode('calling');
                } else {
                    alertify.error("Ah, nope.  Can't call yourself.");
                }
            });
            $('.user p.webcam').live('click', function () {


                var targetConnectionId = $(this).attr('data-cid');

                if (targetConnectionId != viewModel.MyConnectionId()) {
                    //روش دوم
                    _RequestedStream = 'video';
                    connectionManager.sendSignal(targetConnectionId, _RequestedStream);
                    $("#" + targetConnectionId).parent(".slave").css("display", "block");
                    //// روش اول
                    ////hang up first
                    //_hub.server.hangUp(targetConnectionId);
                    //// _hub.revoke('HangUp', targetCo/
                    //connectionManager.closeConnection(targetConnectionId);
                    //viewModel.Mode('idle');

                    ////create connection next
                    //_RequestedStream = 'video';
                    //// connectionManager.sendSignal(targetConnectionId, _RequestedStream);

                    //_hub.server.callUser(targetConnectionId, "");// 
                    //console.log("callUser", "");
                    //// UI in calling mode
                    //viewModel.Mode('calling');
                } else {
                    alertify.error("Ah, nope.  Can't call yourself.");
                }
            });
            $('.user p.oneWay').live('click', function () {


                var targetConnectionId = $(this).attr('data-cid');
                if (targetConnectionId != viewModel.MyConnectionId()) {
                    //روش دوم
                    _RequestedStream = 'blank';
                    connectionManager.sendSignal(targetConnectionId, _RequestedStream);
                    $("#" + targetConnectionId).parent(".slave").css("display", "none");

                } else {
                    alertify.error("Ah, nope.  Can't call yourself.");
                }
            });

            $('.user p.userHangup').live('click', function () {
                var targetConnectionId = $(this).attr('data-cid');

                if (targetConnectionId != viewModel.MyConnectionId()) {
                    //hub.invoke('HangUp', id);
                    _hub.server.hangUp(targetConnectionId);
                    // _hub.revoke('HangUp', targetCo/
                    connectionManager.closeConnection(targetConnectionId);
                    viewModel.Mode('idle');
                    $("#" + targetConnectionId).parent(".slave").css("display", "none");

                } else {
                    alertify.error("Ah, nope.  Can't call yourself.");
                }
            });
            $('.user a').live('click', function () {
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
                    _hub.server.hangUp(targetConnectionId);
                    connectionManager.closeConnection(targetConnectionId);
                    _RequestedStream = 'blank';
                    _hub.server.callUser(targetConnectionId, "");// 
                    console.log("callUser", "");

                    //viewModel.Mode('calling');
                } else {
                    alertify.error("Ah, nope.  Can't call yourself.");
                }
            });

            // Add handler for the hangup button
            $('.hangup').click(function () {
                // Only allow hangup if we are not idle
                if (viewModel.Mode() != 'idle') {
                    _hub.server.hangUp("");
                    connectionManager.closeAllConnections("");
                    viewModel.Mode('idle');
                }
            });


            $(".attachment").click(function () {
                $("#fileupload").click();
            });
            $("#addItem").click(function () {
                $("#fileupload").click();
            });
            $("#fileupload").on('change', function () {

                var input = this;
                var url = $(this).val()
                var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
                var filename = url.substring(url.lastIndexOf('\\') + 1).toLowerCase();
                if (input.files && input.files[0] && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) {
                    $("#attachmentDiv").fadeIn();

                    const mydiv = document.createElement('div');
                    mydiv.className = 'thumbItem added';
                    mydiv.innerHTML = `<img src="#" style="width:100%;height:100%"/>`;

                    var reader = new FileReader();

                    reader.onload = function (e) {
                        sourc = e.target.result;
                        $('#preview').attr('src', sourc);
                        mydiv.firstChild.setAttribute("src", sourc);

                    }

                    reader.readAsDataURL(input.files[0]);
                    $(".thumbHolder").append(mydiv);
                    let key = $("#fileupload").val();

                    _Attachment[key] = input.files[0];

                } else {
                    $("#attachmentDiv").fadeIn();

                    const mydiv = document.createElement('div');
                    mydiv.className = 'thumbItem added';
                    let key = $("#fileupload").val();
                    mydiv.innerHTML = `<img src="/images/fileicon.png" style="width:100%;height:100%"/>`;
                    $('#preview').attr('src', '/images/fileicon.png');
                    $('#previewText').text(filename);

                    $(".thumbHolder").append(mydiv);

                    _Attachment[key] = input.files[0];
                }


                //if (input.files && input.files[0]) {
                //    _Attachment = input.files[0]
                //    $("#attachmentDiv").show();
                //    var reader = new FileReader();
                //    reader.onload = function () {
                //        $("#preview").attr("src", reader.result);
                //    }

                //    reader.readAsDataURL(file);

                //    //$("#preview").attr('src', $("#fileupload").val()); 
                //   // $(".previewImage").attr() text($(this).val()
                //}
                //else {
                //    // alert("s")
                //}

            });
            $("#removePreview").click(function () {
                $("#attachmentDiv").fadeOut();
                _Attachment = {};
                $('.added').remove();
            });


            $(".submit").click(function () {  // به ازای هر آبجکت علاوه بر ذخیره سازی یه بلاب برای نمایش میسازد و مسیج را نیز میفرستد همراه با آرایه




                $("#attachmentDiv").hide();
                var messageType = "text";
                var message = $("#chatMessage").val();
                let count = 0;
                _Attachment2 = {};

                var ul = $(".messages ul");

                $.each(_Attachment, function (key, value) {
                    count += 1;

                    var ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
                    var filename = key.substring(key.lastIndexOf('\\') + 1).toLowerCase();
                    var ul = $(".messages ul");

                    if (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg") {

                        reader = new FileReader();
                        var progressID = _makeid();
                        reader.onload = function (e) {
                            count += 1;
                            const li = document.createElement('li');
                            li.className = "sent";
                            li.innerHTML = `<img id="` + progressID + `" src="` + e.target.result + `" style="float:right; width: 150px;border-radius:0; position: relative;background-color: #ddd;color: black;"/>`;
                            ul.append(li);
                            messageType = 'image';


                            // $("#chatMessage2").val('');
                            //$('#preview').attr('src', sourc);
                            //mydiv.firstChild.setAttribute("src", sourc);

                        }

                        reader.readAsDataURL(value);
                    }
                    else {

                        var progressID = _makeid();
                        const li = document.createElement('li');
                        li.className = "sent";
                        li.innerHTML = `<div class='fileUploadParent row' id="` + progressID + `" style=""><div class="row"><img  src="/images/fileicon.png" /><span  >` + filename + `</span></div></div>`;
                        ul.append(li);
                        messageType = 'image';



                    };


                    _Attachment2[filename + ";;;" + progressID] = value;

                });

                if (count != 0) {   // اگر تعداد فایل بالای صفر باشد دیگر کاری به نوشته دارد و فایل ها را میفرستد برای ارسال

                    _Attachment = {};
                    var returnName = _sendFile(_Attachment2);

                }
                else {


                    var Username = $("#chatname").text();
                    if (message != '') {
                        var progressID = _makeid();
                        _hub.server.sendMessage(message, $("#hiddeninput").val(), messageType, progressID);
                        $("#chatMessage").val('');
                        var ul = $(".messages ul");
                        const li = document.createElement('li');
                        li.className = 'sent';
                        li.innerHTML = `<div id=` + progressID + `><p>` + message + `</p><i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;left: 0px;color: white;"></i></div> `;
                        // var li = ' <li class="sent"> <img src = "http://emilcarlsson.se/assets/mikeross.png" alt = "" /> </li >';
                        ul.append(li);





                    };

                    //var objDiv = $("#messages");


                }


                var objDiv = document.getElementById("message");
                objDiv.scrollTop = objDiv.scrollHeight;
                console.log($("#message").offset().top + '-');

                $(".message-input").val('');

                //var objDiv = document.getElementsByClassName("messages");
                //objDiv.scrollTop = objDiv.scrollHeight;
            });
            $(".chat").click(function () {
                console.log("hit")
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
                        $(".user-list").css("display", "block");
                        $("#vidoeHolder").animate({
                            width: '60%'
                        });
                        $("#chatHolder").animate({
                            width: '40%'
                        })
                    }
                    else {
                        $(".user-list").css("display", "none");
                        $("#vidoeHolder").animate({
                            width: '100%'
                        });
                        $("#chatHolder").animate({
                            width: '0%'
                        })
                    }

                }


            });

            $('#save-recording').click(function () {
                this.disabled = true;
                mediaRecorder.save();
            });
            $(".dwimg").click(function () {
                alert("ss");
                let img = $(this).parent().find("span").text();
               
            })
            $("#recodrdVoice").on('mousedown', function (e) {

                _startRecording();
            });
            $("#recodrdVoice").on('mouseup', function (e) {

                _stopRecording();
            });
            },


       


    _captureUserMedia = function (mediaConstraints, successCallback, errorCallback) {

        navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
    },
        _startRecording = function (idx) {
            //$('#start-recording').disabled = true;
            //audiosContainer = document.getElementById('audios-container');
            //document.getElementById("clicks").innerHTML = "درحال رکورد";

            var f = document.getElementById('clicks');
            intervalVar = setInterval(function () {
                f.style.display = (f.style.display == 'none' ? '' : 'none');
            }, 1000);
            var mediaConstraints = {
                audio: true
            };
            _captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
        },
        onMediaSuccess = function (stream) {
            var TOK = $("#validation").val();

            mediaRecorder = new MediaStreamRecorder(stream);
            mediaRecorder.stream = stream;
            mediaRecorder.mimeType = 'audio/wav';
            mediaRecorder.audioChannels = 1;
            mediaRecorder.ondataavailable = function (blob) {

                var fileObject = new File([blob], "test.wav", {
                    type: 'audio/wav'
                });


                // در اینجا بلاب راظاهر میکنیم

                var reader = new FileReader();
                var progressID = _makeid();
                reader.onload = function (e) {

                    const li = document.createElement('li');
                    li.className = "sent";
                    li.innerHTML = `<audio id=` + progressID + ` controls='' style="float:right"><source src="` + e.target.result + `"></source></audio>`;;
                    var ul = $(".messages ul");
                    ul.append(li);
                }

                reader.readAsDataURL(fileObject);










                var formData = new FormData();

                // recorded data
                formData.append('audio-blob', fileObject);

                // file name
                formData.append('audio-filename', fileObject.name);
                let request = new XMLHttpRequest();
                request.open('POST', '/Screen/sendToServer');

                // upload progress event
                request.upload.addEventListener('progress', function (e) {
                    let percent_complete = parseInt((e.loaded / e.total) * 100);

                    let classname = '';
                    if (percent_complete >= 50) {
                        classname = 'over50';
                    }
                    let srt = `<div style="right:270px;"  class="progress-circlle ` + classname + `  p` + percent_complete + ` "><span>` + percent_complete + `%</span><div class="left-half-clipper"><div class="first50-bar"></div><div class="value-bar"></div></div></div>`;
                    var spg = $("#" + progressID).parent();

                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })
                    spg.append(srt);
                });

                // AJAX request finished event
                request.addEventListener('load', function (e) {

                    var spg = $("#" + progressID).parent();
                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })
                    let check = `<i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;left: 0px;color: white;"></i>`;
                    spg.append(check);

                    let messageType;
                    let rsp = request.response;

                    messageType = 'audio';

                    _hub.server.sendMessage(rsp, $("#hiddeninput").val(), messageType, progressID);// اینجا میفرسته برا ادمین
                    console.log('resid');
                    $("#chatMessage2").val('');


                    var objDiv = document.getElementById("message");
                    console.log($("#message").offset().top + '-');

                    objDiv.scrollTop = objDiv.scrollHeight;

                    message = "";
                    console.log(request.status);
                    console.log(request.response);


                });
                request.send(formData);
            };

            var timeInterval = 360 * 1000;
            mediaRecorder.start(timeInterval);
            // $('#stop-recording').disabled = false;
        },
        onMediaError = function (e) {
            console.error('media error', e);
        },
        _stopRecording = function () {
            clearInterval(intervalVar);

            document.getElementById("clicks").style.display = "none";

            //var f = document.getElementById('clicks');
            //setInterval(function () {
            //    f.style.display = (f.style.display == 'none' ? '' : 'none');
            //}, 10000);
            mediaRecorder.stop();
            mediaRecorder.stream.stop();


            //$('.start-recording').disabled = false;
        },
        bytesToSize = function (bytes) {
            var k = 1000;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) return '0 Bytes';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        },
        getTimeLength = function (milliseconds) {
            var data = new Date(milliseconds);
            return data.getUTCHours() + " hours, " + data.getUTCMinutes() + " minutes and " + data.getUTCSeconds() + " second(s)";
        },
        _makeid = function () {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < 10; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },

        _sendFile = function (file) {

            let total = 0;
            let counter = 0;
            $.each(file, function (key, value) {
                total += 1;
            });
            $.each(file, function (key, value) {


                let progressID = key.split(';;;')[1];
                key = key.split(';;;')[0];

                var ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
                var filename = key.substring(key.lastIndexOf('\\') + 1).toLowerCase();
                let messageType = null;
                if (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg") {
                    messageType = 'image';
                }
                else {
                    messageType = 'file';
                }


                var formData = new FormData();
                var fileName = key
                formData.append('blob', value);
                formData.append('filename', fileName);
                let request = new XMLHttpRequest();
                request.open('POST', '/screen/sendToServer');
                request.upload.addEventListener('progress', function (e) {
                    let percent_complete = parseInt((e.loaded / e.total) * 100);

                    let classname = '';
                    if (percent_complete >= 50) {
                        classname = 'over50';
                    }
                    let classnamerForthis = '';
                    if (messageType == 'file') {
                        classnamerForthis = 'filePostition';
                    }

                    let srt = `<div  class="` + classnamerForthis + `  progress-circlle ` + classname + `  p` + percent_complete + ` "><span>` + percent_complete + `%</span><div class="left-half-clipper"><div class="first50-bar"></div><div class="value-bar"></div></div></div>`;
                    var spg = $("#" + progressID).parent();

                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })
                    spg.append(srt);

                    //console.log(e.loaded / e.total + "-" + percent_complete + "%");
                });

                // AJAX request finished event
                request.addEventListener('load', function (e) {

                    var ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
                    var filename = key.substring(key.lastIndexOf('\\') + 1).toLowerCase();
                    let messageType = null;
                    if (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg") {
                        messageType = 'image';
                    }
                    else {
                        messageType = 'file';
                    }


                    var ul = $(".messages ul");
                    counter += 1;

                    let rsp = request.response;
                    var spg = $("#" + progressID).parent();



                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })

                    let check = `<i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;left: 0px;color: white;"></i>`;
                    spg.append(check);
                    //if (messageType == "image") {
                    //    let check = `<i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;right: 140px;color: white;"></i>`;
                    //    spg.append(check);
                    //}
                    //else {
                        
                    //}





                    if (counter == total) {
                        message = $("#chatMessage2").val();

                        if (message != '') {
                            const li2 = document.createElement('li');
                            li2.className = "sent";
                            let htmlsrt2;
                            htmlsrt2 = `<p>` + message + `</p> `;
                            li2.innerHTML = htmlsrt2;
                            ul.append(li2);
                            message = message + "***" + rsp;


                        }
                        else {
                            message = rsp;
                        }
                        _Attachment = {};
                        $('.added').remove();
                        $("#fileupload").val('');
                        $("#chatMessage2").val('');

                    }
                    else {
                        message = rsp;
                    }

                    _hub.server.sendMessage(message, $("#hiddeninput").val(), messageType, progressID);// اینجا میفرسته برا ادمین


                    //setInterval(function () {

                    //}, 1000);
                    var myobj = document.getElementById("message");
                    myobj.scrollTop = myobj.scrollHeight;



                    message = "";

                })
                // send POST request to server side script
                request.send(formData);
            })


        },



        _setName = function (name) {
            viewModel.Groupname(name);
        },
        _chatSelectedfnc = function (name) {
            _chatSelected = name;
        },
        _resetStream = function (id) {



            var hub = $.connection.chatHub;
            // SteamToGo[0] = $("#" + id).src;  // STes[id];
            if (SteamUsedID.includes(id)) {
                console.log("stream exist")
                var IN = SteamUsedID.indexOf(id);
                SteamUsedID[IN] = "0";
                SteamToGo[IN] = blackSilence();
                var IDD = "main" + IN;
                var video = document.getElementById(IDD);
                video.srcObject = null;
                video.parentElement.style.display = "none";
                hub.server.hideVideoOnClient(viewModel.Groupname(), IN + 1);

            }
            else {
                console.log("stream not exist")
                var IN2 = SteamUsedID.indexOf("0");
                console.log(IN2)

                SteamUsedID[IN2] = id;
                var IDD = "main" + IN2;
                console.log(IDD);
                var video = document.getElementById(IDD);
                video.srcObject = STes[id];
                video.parentElement.style.display = "inline-block";
                console.log(SteamUsedID[IN2]);

                SteamToGo[IN2] = STes[id];
                hub.server.showVideoOnClient(viewModel.Groupname(), IN2 + 1);

            }



            var count = 0;
            console.log("count is =" + count);
            $(".mainholder").each(function (index, value) {

                if (`${this.style.display}` != "none") {
                    count = count + 1;
                }

            });
            console.log("count is =" + count);
            if (count == 1) {
                $(".mainholder").css("width", "100%");
                $(".mainholder").css("height", "100%");
            }
            else if (count == 2) {
                $(".mainholder").css("width", "50%");
                $(".mainholder").css("height", "100%");
            }
            else {
                $(".mainholder").css("width", "50%");
                $(".mainholder").css("height", "50%");
            }

            connectionManager.changeTrack(SteamToGo, id);



        },
        _setupHubCallbacks = function (hub) {



        },


        // Connection Manager Callbacks
        _callbacks = {

            onReadyForStream: function (connection) {
                // The connection manager needs our stream
                // todo: not sure I like this


                connection.addStream(_mediaStream);



            },
            onStreamAdded: function (partnerClientId, event) {


                console.log("on track added fire");

                final.srcObject = event.stream;

                $(".hangup").css("display", "inline-block");

                //var i = new MediaStream();
                //if (event.streams != null) {
                //    if (event.streams[0].getVideoTracks() != null) {
                //        if (event.streams[0].getAudioTracks()[0] != null) {
                //            i.getAudioTracks[0] = event.stream[0].getAudioTracks[0];
                //            console.log("is-audio ")
                //        }
                //        else {
                //            console.log("is-audio first ")
                //        }

                //    }
                //    else {
                //        console.log("is-audio totally ")
                //    }
                //}
                //else {
                //    console.log("stream is blank ")
                //}

                //if (event.stream.getVideoTracks[0] != null) {
                //    i.getVideoTracks[0] = event.stream.getVideoTracks[0];
                //    console.log("is-video ")
                //}



                //var ListOfVideo = document.getElementById(partnerClientId);
                //if (ListOfVideo == null) {
                //    const div = document.createElement('div');
                //    div.className = 'slave';
                //    div.style.display = 'none';

                //    div.innerHTML = ` <video controls style="max-height:150px" id='` + partnerClientId + `' class='video partner cool-background' autoplay='autoplay' onclick='changeStream(this.id)' ></video>  `;


                //    var VHolder = document.getElementById('videoHolder');
                //    VHolder.appendChild(div);
                //    var vid = document.getElementById(partnerClientId);
                //    attachMediaStream(vid, event.stream);
                //    STes[partnerClientId] = event.stream;

                //}
                //else {
                //    attachMediaStream(ListOfVideo, event.stream);
                //    STes[partnerClientId] = event.stream;
                //}
                //if (_RequestedStream == 'video') {
                //    connectionManager.sendSignal(partnerClientId, _RequestedStream);
                //    $("#" + partnerClientId).parent(".slave").css("display", "block");
                //    _RequestedStream == 'blank';

                //   // partnerClientId
                //}







                //if (event.stream.getAudioTracks() != null) {
                //    if (event.stream.getAudioTracks()[0] != null) {
                //        // Bind the remote stream to the partner window
                //        STes[partnerClientId] = event.stream;


                //        const div = document.createElement('div');
                //        div.className = 'span4';
                //        if (event.stream.getVideoTracks() == "") {
                //            console.log("no-video ")
                //            div.innerHTML = ` <h4>مخاطب</h4> <audio id='` + partnerClientId + `'  controls autoplay class="audio mine"></audio> `;

                //        } else {
                //            div.innerHTML = `<h6 style="display:inline-block">مخاطب</h6> <video controls style="max-height:150px" id='` + partnerClientId + `' class='video partner cool-background' autoplay='autoplay' onclick='changeStream(this.id)' ></video>  `;
                //            console.log("no-audio ")
                //        }
                //        //div.innerHTML = ` <h4>مخاطب</h4> <audio id='` + partnerClientId + `'  controls autoplay class="audio mine"></audio> `;

                //        // div.innerHTML = ` <h4>مخاطب</h4> <video id='` + partnerClientId + `' class='video partner cool-background' autoplay='autoplay' onclick='changeStream(this.id)' ></video>  `;

                //        var VHolder = document.getElementById('videoHolder');
                //        VHolder.appendChild(div);

                //        var ListOfVideo = document.getElementById(partnerClientId);
                //        attachMediaStream(ListOfVideo, event.stream);

                //    }
                //}



                //console.log('binding remote stream to the partner window');

                //if (event.stream.getAudioTracks() != null) {
                //    if (event.stream.getAudioTracks()[0] != null) {
                //        // Bind the remote stream to the partner window
                //        STes[partnerClientId] = event.stream;


                //        const div = document.createElement('div');
                //        div.className = 'span4';
                //        if (event.stream.getVideoTracks() == "") {
                //            console.log("no-video ")
                //            div.innerHTML = ` <h4>مخاطب</h4> <audio id='` + partnerClientId + `'  controls autoplay class="audio mine"></audio> `;

                //        } else {
                //            div.innerHTML = `<h6 style="display:inline-block">مخاطب</h6> <video controls style="max-height:150px" id='` + partnerClientId + `' class='video partner cool-background' autoplay='autoplay' onclick='changeStream(this.id)' ></video>  `;
                //            console.log("no-audio ")
                //        }
                //        //div.innerHTML = ` <h4>مخاطب</h4> <audio id='` + partnerClientId + `'  controls autoplay class="audio mine"></audio> `;

                //        // div.innerHTML = ` <h4>مخاطب</h4> <video id='` + partnerClientId + `' class='video partner cool-background' autoplay='autoplay' onclick='changeStream(this.id)' ></video>  `;

                //       
                //        VHolder.appendChild(div);

                //        var ListOfVideo = document.getElementById(partnerClientId);
                //        attachMediaStream(ListOfVideo, event.stream);

                //    }
                //}




                // for closing all connection and repoening them
                //if (_indexMustBeChange == "1") {

                //   // SteamToGo["1"] = STes[_index];
                //    var hub = $.connection.chatHub;
                //    _index = partnerClientId;
                //    _RequestedStream = 'blank';
                //    console.log('index after change : ' + _index);
                //    hub.invoke('HangUpEcexpt', _index);
                //    WebRtcDemo.ConnectionManager.closeAllConnections(_index);
                //    WebRtcDemo.ViewModel.Mode('idle');
                //    hub.invoke('resetAllConnction', _index);

                //}



                //for (var i = 0; i <ListOfVideo.length; ++i) {
                //    var id = ListOfVideo[i].attr['id'];
                //    console.log(id);
                //    attachMediaStream(ListOfVideo[i], STes[id]);
                //    console.log(i + "");

                //}

                //  attachMediaStream(otherVideo, STes[id]); // from adapter.js
            },

            onTrackAdded: function (connection, event) {

                console.log("on track added fire");
                var partnerClientId = "hhjhj";
                //if (event.streams[0] != null) {

                //    // Bind the remote stream to the partner window
                //    //var i;
                //    //for (i = 0; i <2; i++) {
                //    //    if (event.streams[0].getAudioTracks[1] != null) {

                //    //    }
                //    //}

                //    var i = new MediaStream();
                //    i.getAudioTracks[0] = event.streams[0].getAudioTracks[0];
                //    i.getVideoTracks[0] = event.streams[0].getVideoTracks[0];
                //    const div = document.createElement('div');
                //    div.className = 'span4';
                //    console.log("no-video ")
                //    div.innerHTML = `<h6 style="display:inline-block">مخاطب</h6> <video controls style="max-height:150px" id='` + partnerClientId + `' class='video partner cool-background' autoplay='autoplay' onclick='changeStream(this.id)' ></video>  `;


                //    var VHolder = document.getElementById('videoHolder');
                //    VHolder.appendChild(div);

                //    var ListOfVideo = document.getElementById(partnerClientId);
                //    attachMediaStream(ListOfVideo, i);



                //    STes[partnerClientId] = event.streams[0];




                //}




                //if (event.stream.getAudioTracks() != null) {
                //    if (event.stream.getAudioTracks()[0] != null) {
                //         Bind the remote stream to the partner window
                //        STes[partnerClientId] = event.stream;


                //        const div = document.createElement('div');
                //        div.className = 'span4';
                //        if (event.stream.getVideoTracks() == "") {
                //            console.log("no-video ")
                //            div.innerHTML = ` <h4>مخاطب</h4> <audio id='` + partnerClientId + `'  controls autoplay class="audio mine"></audio> `;

                //        } else {
                //            div.innerHTML = `<h6 style="display:inline-block">مخاطب</h6> <video controls style="max-height:150px" id='` + partnerClientId + `' class='video partner cool-background' autoplay='autoplay' onclick='changeStream(this.id)' ></video>  `;
                //            console.log("no-audio ")
                //        }
                //        div.innerHTML = ` <h4>مخاطب</h4> <audio id='` + partnerClientId + `'  controls autoplay class="audio mine"></audio> `;

                //         div.innerHTML = ` <h4>مخاطب</h4> <video id='` + partnerClientId + `' class='video partner cool-background' autoplay='autoplay' onclick='changeStream(this.id)' ></video>  `;

                //        var VHolder = document.getElementById('videoHolder');
                //        VHolder.appendChild(div);

                //        var ListOfVideo = document.getElementById(partnerClientId);
                //        attachMediaStream(ListOfVideo, event.stream);

                //    }
                //}





            },

            onStreamRemoved: function (connection, partnerClientId) {
                // todo: proper stream removal.  right now we are only set up for one-on-one which is why this works.

                console.log('removing remote stream from partner window');
                _noMoreConnection = ""
                console.log(partnerClientId);
                // Clear out the partner window

                var otherVideo = document.getElementById(partnerClientId);
                if (otherVideo != null) {
                    otherVideo.src = '';
                    otherVideo.parentElement.remove();
                }

            }
        };


    return {
        start: _start, // Starts the UI process
        getStream: function () { // Temp hack for the connection manager to reach back in here for a stream
            return _mediaStream;
        },
        resetStream: _resetStream,
        setName: _setName,
        chatselectedFun : _chatSelectedfnc,
    };
})(WebRtcDemo.ViewModel, WebRtcDemo.ConnectionManager);

// Kick off the app

WebRtcDemo.App.start();

//$.getScript('/Scripts/webrtcdemo/mu.js', function () {

//});



