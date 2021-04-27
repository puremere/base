//
var makeid = function () {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
var uploadImage = function (imageParent, imageName, input) {


    // var ext = input.files[0].filename.substring(url.lastIndexOf('.') + 1).toLowerCase();
    //&& (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")
    if (input.files && input.files[0]) {
        var processID = makeid();
        var htmldiv = `<div class="imageCover" style="postion:relative !important; width:150px"><div style="position:relative"><img style="width:150px" id="` + processID + `" src="#" /> </div></div> `;

        $("#" + imageParent).append(htmldiv);
        var mydiv = document.getElementById(processID);

        let key = input.files[0].fileName;

        var reader = new FileReader();
        reader.addEventListener("load", function () {
            mydiv.src = reader.result;

        }, false);

        reader.readAsDataURL(input.files[0]);
        sendFile(key + ";;;" + processID, input.files[0], imageName);
        return key;

    }
}


var sendFile = function (key, value, imageName) {

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
    request.open('POST', '/admin/sendToServerByJS');
    request.upload.addEventListener('progress', function (e) {

        let percent_complete = parseInt((e.loaded / e.total) * 100);

        let classname = '';
        if (percent_complete >= 50) {
            classname = 'over50';
        }



        let srt = `<div class="progress" style="position:absolute;width:100%"><div class="progress-bar" role="progressbar" style="width: ` + percent_complete + `%" aria-valuenow="` + percent_complete + `" aria-valuemin="0" aria-valuemax="100"></div></div>`
        //let srt = `<div  class=" progress-circlle ` + classname + `  p` + percent_complete + ` "><span>` + percent_complete + `%</span><div class="left-half-clipper"><div class="first50-bar"></div><div class="value-bar"></div></div></div>`;
        var spg = $("#" + progressID).parent();

        spg.children('.progress').each(function () {
            this.remove();
        })
        spg.append(srt);

        //console.log(e.loaded / e.total + "-" + percent_complete + "%");
    });

    // AJAX request finished event
    request.addEventListener('load', function (e) {

        var ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
        var filename = key.substring(key.lastIndexOf('\\') + 1).toLowerCase();
        var srt = $("." + imageName).text();
        $("." + imageName).text(request.response + "," + srt);
        let rsp = request.response;
        var spg = $("#" + progressID).parent();
        var name = "" + rsp;


        spg.children('.progress').each(function () {
            this.remove();
        })
        let check = `<img onclick= removeImage("` + progressID + `***` + name + `","` + imageName + `")   id="R` + progressID + `"  src="/images/trash.png" style="position:absolute; bottom:0;top:0;left:0;right:0;margin:auto" /> `;
        spg.append(check);
        //onclick=removeImage(` + rsp + `)
    })
    // send POST request to server side script
    request.send(formData);

};
//$(".removeImage").click(function () {
//    var element = $(this)
//    var name = element.attr('id');
//    $.ajax({
//        url: "/home/removeimage",
//        data: {
//            id: name
//        },
//        success: function () {
//            element.parent().remove();
//            //var srt = $("." + imageName).text();
//            //alert(srt);
//            //srt = srt.replace(name + ",", "");
//            //$("." + imageName).text(srt);
//        }
//    })
//});
var removeImage = function (DAT, imageName) {
    let id = "R" + DAT.split('***')[0];
    let name = DAT.split('***')[1];

    $.ajax({
        url: "/admin/removeimage",
        data: {
            id: name
        },
        success: function () {
            var srt = $("." + imageName).text();

            $("." + imageName).text(srt.replace(name + ",", ""));
            $("#" + id).parent().parent().remove();
        }
    })
};


