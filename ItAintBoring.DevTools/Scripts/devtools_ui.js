"use strict";
var Sdk = window.Sdk || {};
Sdk.UI = Sdk.UI || {};


Sdk.UI.fileUploadDialogControlName = null;
Sdk.UI.fileUploadAreaControl = null;
Sdk.UI.fileData = null;

Sdk.UI.htmlToElement = function(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    document.getElementsByTagName('body')[0].appendChild(template.content.firstChild);
    //return template.content.firstChild;
}

Sdk.UI.createProgressDialog = function () {
    var dialogTemplate = "<div id='progressDialog' style='display: none'>"
        +"<div id='progressbar' class='noborder' ></div>"
        + "</div>";
    var dialog = Sdk.UI.htmlToElement(dialogTemplate);
    Sdk.createProgressDialog("progressDialog", "progressbar");
}




Sdk.UI.createFileUploadDialog = function () {
    
    var fileUploadTemplate = document.getElementById('fileUploadTemplate');
    //alert(fileUploadTemplate);
    var newElem = document.getElementsByTagName('body')[0].appendChild(fileUploadTemplate.content.firstChild);
    Sdk.UI.fileUploadDialogControlName = "fileUploadDialog";
    //var dialogTemplate = "";
    //Sdk.UI.htmlToElement(dialogTemplate);
    /*
    


    Sdk.UI.fileUploadAreaControl = document.getElementById("filearea");
    Sdk.UI.fileUploadAreaControl.addEventListener("dragenter", Sdk.UI.dragenter, false);
    Sdk.UI.fileUploadAreaControl.addEventListener("dragover", Sdk.UI.dragover, false);
    Sdk.UI.fileUploadAreaControl.addEventListener("drop", Sdk.UI.drop, false);
    */
    
    $("#" + Sdk.UI.fileUploadDialogControlName).dialog({
        height: 400,
        width: 440,
        title: "File Upload",
        modal: true,
        autoOpen: false,
        buttons: [
            {
                text: "OK",

                click: function () {
                    Sdk.showProgressBar();
                    Sdk.uploadFile(Sdk.UI.fileData, function () {
                        $(this).dialog("close");
                        Sdk.hideProgressBar();
                    }, function (error) {
                        Sdk.hideProgressBar();
                        alert(error);
                    });
                    
                }

                // Uncommenting the following line would hide the text,
                // resulting in the label being used as a tooltip
                //showText: false
            },
            {
                text: "Cancel",

                click: function () {
                    $(this).dialog("close");
                }

                // Uncommenting the following line would hide the text,
                // resulting in the label being used as a tooltip
                //showText: false
            }
        ]

    });
}

Sdk.UI.dragenter = function(e) {
    e.stopPropagation();
    e.preventDefault();
}

Sdk.UI.dragover = function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

Sdk.UI.drop = function(e) {
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;
    var files = dt.files;

    handleFiles(files);
}

Sdk.UI.openFileUploadDialog = function () {
    var dlg = $("#" + Sdk.UI.fileUploadDialogControlName);
    if (typeof(dlg[0].onOpen) != 'undefined') {
        dlg[0].onOpen();
    }
    dlg.dialog('open');
}



Sdk.UI.handleFiles = function (e) {
    for (var i = 0; i < e.files.length; i++) {
        var file = e.files[i];

        var img = document.createElement("img");
        img.classList.add("obj");
        img.file = file;
        //preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.

        var reader = new FileReader();
        reader.onload = (function (aImg) {
            return function (e) {
                debugger;
                Sdk.UI.fileData = e.target.result;
                
            };
        })(file);
        reader.readAsDataURL(file);
    }
}

Sdk.UI.init = function () {
    Sdk.UI.createProgressDialog();
    
    Sdk.UI.createFileUploadDialog();
    
}





