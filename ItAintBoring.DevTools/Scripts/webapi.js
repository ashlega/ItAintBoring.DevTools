"use strict";
var Sdk = window.Sdk || {};

Sdk.currentWor = null;
Sdk.currentData = null;
Sdk.UserInfo = null;
Sdk.progressDialogControl = null;
Sdk.webResourceDialogControl = null;
Sdk.progressBarControl = null;
Sdk.importAllDialogControl = null;
Sdk.importAllSettings = null;
Sdk.MessageFilters = [{ primaryobjecttypecode: "account", sdkmessagename: "create", _sdkmessageid_value: 123 }];

Sdk.webAPIPath = "../../../api/data/v8.2";      // Path to the web API.

var sdkMessagesFetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" +
    "<entity name='sdkmessagefilter'>" +
    "<attribute name='sdkmessageid'/>" +
    "<attribute name='primaryobjecttypecode'/>" +
    "<order attribute='primaryobjecttypecode' descending='false' />" +
    "<link-entity name='sdkmessage' from='sdkmessageid' to='sdkmessageid' visible='false' link-type='outer' alias='sdkmessage'>" +
    "<attribute name='name'/>" +
    "</link-entity>" +
    "</entity>" +
    "</fetch>";


Sdk.request = function (action, uri, data, formattedValue, maxPageSize) {

    uri = Sdk.webAPIPath + uri;

    if (!RegExp(action, "g").test("POST PATCH PUT GET DELETE")) { // Expected action verbs.
        throw new Error("Sdk.request: action parameter must be one of the following: " +
            "POST, PATCH, PUT, GET, or DELETE.");
    }
    if (!typeof uri === "string") {
        throw new Error("Sdk.request: uri parameter must be a string.");
    }
    if ((RegExp(action, "g").test("POST PATCH PUT")) && (data === null || data === undefined)) {
        //PublishAllXml?
        // throw new Error("Sdk.request: data parameter must not be null for operations that create or modify data.");
    }
    if (maxPageSize === null || maxPageSize === undefined) {
        maxPageSize = 1000; // Default limit is 10 entities per page.
    }

    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open(action, encodeURI(uri), true);
        request.setRequestHeader("OData-MaxVersion", "4.0");
        request.setRequestHeader("OData-Version", "4.0");
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.setRequestHeader("Prefer", "odata.maxpagesize=" + maxPageSize);
        request.setRequestHeader("Cache-Control", "no-cache")
        if (formattedValue) {
            request.setRequestHeader("Prefer",
                "odata.include-annotations=OData.Community.Display.V1.FormattedValue");
        }
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                request.onreadystatechange = null;
                switch (this.status) {
                    case 200: // Success with content returned in response body.
                    case 204: // Success with no content returned in response body.
                        resolve(this);
                        break;
                    default: // All other statuses are unexpected so are treated like errors.
                        var error;
                        try {
                            error = JSON.parse(request.response).error;
                        } catch (e) {
                            error = new Error("Unexpected Error");
                        }
                        reject(error);
                        break;
                }
            }
        };
        if (data == null) {
            request.send(data);
        }
        else if (typeof data != "string") {
            request.send(JSON.stringify(data));
        }
        else {
            request.send(data);
        }
    });
};



Sdk.whoAmI = function (onSuccess) {
    Sdk.request("GET", "/WhoAmI", null) // Adding sample data so we can query against it.
        .then(function (request) {
            Sdk.UserInfo = JSON.parse(request.response);
            onSuccess();
        })
        .catch(function (error) {
            Sdk.UserInfo = {};
            Sdk.UserInfo.OrganizationId = '123';
            onSuccess();
        });
}

Sdk.publishXml = function (entitySetName, entityName, entityId, onSuccess, onError) {

    var parameters = {};
    parameters.ParameterXml = "<importexportxml><"+entitySetName+"><"+entityName+">" + entityId + "</"+entityName+"></"+entitySetName+"></importexportxml>";

    Sdk.request("POST", "/PublishXml", parameters) // Adding sample data so we can query against it.
        .then(function (request) {
            onSuccess();
        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.publishWebResource = function (webresourceid, onSuccess, onError) {

    var parameters = {};
    Sdk.publishXml("webresources", "webresource", webresourceid, onSuccess, onError);
}

Sdk.output = function (collection, label, properties) {
    console.log(label);
    collection.forEach(function (row, i) {
        var prop = [];
        properties.forEach(function (p) {
            var f = p + "@OData.Community.Display.V1.FormattedValue";
            prop.push((row[f] ? row[f] : row[p])); // Get formatted value if one exists for this property.
        })
        console.log("\t%s) %s", i + 1, prop.join(", "));
    });
}




Sdk.getLoadedResourceById = function (id) {
    var foundRow = null;
    if (Sdk.currentData != null) {
        Sdk.currentData.rows.forEach(function (row) {
            if (row.webresourceid == id) {
                foundRow = row;
                //break;
            }
        });
    }
    return foundRow;
}

Sdk.updateWebResource = function (data, onSuccess, onError) {
    var uri = "/ita_updatewebresource";
    var resourceDetails = {};
    resourceDetails.id = data.webresourceid;
    resourceDetails.description = JSON.stringify(data);
    var result = Sdk.request("POST", uri, resourceDetails) // Adding sample data so we can query against it.
        .then(function (request) {
            Sdk.publishWebResource(data.webresourceid, onSuccess, onError);
            //onSuccess();
        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.uploadFile = function (fileData, onSuccess, onError) {
    var uri = "/ita_fileupload";
    var resourceDetails = {};
    resourceDetails.command = "uploadfile";
    resourceDetails.parameters = JSON.stringify({ fileData: fileData, assemblyId: null });
    var result = Sdk.request("POST", uri, resourceDetails) // Adding sample data so we can query against it.
        .then(function (request) {
            onSuccess();
        })
        .catch(function (error) {
            onError(error.message);
        });
}


Sdk.updateWebResourceOld = function (data, onSuccess, onError) {
    var uri = "/webresourceset(" + data.webresourceid + ")";
    var updatedResource = {};
    updatedResource.webresourceid = data.webresourceid;
    updatedResource.description = JSON.stringify(data);
    var result = Sdk.request("PATCH", uri, updatedResource) // Adding sample data so we can query against it.
        .then(function (request) {
            Sdk.publishWebResource(data.webresourceid, onSuccess, onError);
            //onSuccess();
        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.publishAll = function (onSuccess, onError) {
    //TODO
    //Add publish all
    var uri = "/PublishAllXml";
    Sdk.request("POST", uri, null) // Adding sample data so we can query against it.
        .then(function (request) {
            onSuccess();
        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.deleteWebResource = function (webResourceId, onSuccess, onError) {
    var uri = "/webresourceset(" + webResourceId + ")";
    Sdk.request("DELETE", uri, null) // Adding sample data so we can query against it.
        .then(function (request) {
            onSuccess();
            //Sdk.publishAll(onSuccess, onError);
        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.createWebResource = function (data, onSuccess, onError) {
    var uri = "/webresourceset";
    var createdResource = {};
    data.homeorganization = Sdk.UserInfo.OrganizationId;
    data.type = "ita_configuration_data";
    var fetchXml = data.fetchxml;
    data.fetchxml = "";
    createdResource.description = JSON.stringify(data);
    data.fetchxml = fetchXml;
    createdResource.webresourcetype = 1;
    createdResource.displayname = (new Date()).getTime().toString() + ".html";
    createdResource.name = "ita_/configurationdata/resources/" + createdResource.displayname;
    var result = Sdk.request("POST", uri, createdResource) // Adding sample data so we can query against it.
        .then(function (request) {

            var resourceUri = request.getResponseHeader("odata-entityid");
            var idmatch = resourceUri.match(/\(([^)]+)\)/);
            data.webresourceid = idmatch[1];
            Sdk.updateWebResource(data,
                function () {
                    Sdk.publishWebResource(data.webresourceid, onSuccess, onError);
                },
                onError);
            

        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.getWebResourcesInternal = function (initializeGrid) {

    var uri = "/webresourceset?$select=webresourceid,modifiedon,displayname,description,name&$filter=contains(description,'ita_configuration_data')&$orderby=displayname asc";
    var result = Sdk.request("GET", uri, null, false, 1000) // Adding sample data so we can query against it.
        .then(function (request) {
            var parsedRows = JSON.parse(request.response).value;
            var gridRows = [];
            parsedRows.forEach(function (row) {
                var gridRow = JSON.parse(row.description);

                gridRow.fetchxml = decodeURI(gridRow.fetchxml);
                gridRow.webresourceid = row.webresourceid;
                gridRow.resourcename = row.name;
                gridRows.push(gridRow);
            });
            var response = { current: 1, rowCount: 1000, rows: gridRows, total: gridRows.length };
            Sdk.currentData = response;
            initializeGrid(response);
        })
        .catch(function (error) {
            alert(error.message);
            console.log(error.message);
            var response = $.parseJSON('{"current": 1,"rowCount": 10,"rows": [ {"webresourceid": 19,"displayname": "123@test.de", "modifiedon": "2014-05-30T22:15:00", "description":"test" }],"total": 1123}');
            Sdk.currentData = response;
            initializeGrid(response);
        });
}

Sdk.getWebResources = function (initializeGrid) {

    Sdk.whoAmI(function () {
        Sdk.getWebResourcesInternal(initializeGrid);
    });

}

Sdk.allResourcesSerializationData = null;

Sdk.internalSerializeAllResources = function () {
    if (Sdk.allResourcesSerializationData.currentResource >= Sdk.allResourcesSerializationData.resources.length) {
        Sdk.allResourcesSerializationData.onSuccess();
    }
    else {
        Sdk.serializeWebResource(Sdk.allResourcesSerializationData.resources[Sdk.allResourcesSerializationData.currentResource].webresourceid, null, Sdk.internalSerializeAllResources, Sdk.allResourcesSerializationData.onError);
        Sdk.allResourcesSerializationData.currentResource++;
    }
}

Sdk.internalDeSerializeAllResources = function () {
    if (Sdk.allResourcesSerializationData.currentResource >= Sdk.allResourcesSerializationData.resources.length) {
        Sdk.allResourcesSerializationData.onSuccess();
    }
    else {
        Sdk.deSerializeWebResource(Sdk.allResourcesSerializationData.resources[Sdk.allResourcesSerializationData.currentResource].webresourceid, JSON.stringify(Sdk.importAllSettings), Sdk.internalDeSerializeAllResources, Sdk.allResourcesSerializationData.onError);
        Sdk.allResourcesSerializationData.currentResource++;
    }
}

Sdk.serializeAllResources = function (onSuccess, onError) {
    //Sdk.currentData = { current: 1, rowCount: 10, rows: gridRows, total: gridRows.length };
    Sdk.allResourcesSerializationData = {};
    Sdk.allResourcesSerializationData.onSuccess = onSuccess;
    Sdk.allResourcesSerializationData.onError = onError;
    Sdk.allResourcesSerializationData.resources = [];
    Sdk.currentData.rows.forEach(function (row) {
        if (row.homeorganization == Sdk.UserInfo.OrganizationId) {
            Sdk.allResourcesSerializationData.resources.push(row);
        }
    });

    Sdk.allResourcesSerializationData.resources.sort(function (a, b) { return a.order > b.order });
    Sdk.allResourcesSerializationData.currentResource = 0;
    Sdk.internalSerializeAllResources();
}

Sdk.deSerializeAllResources = function (onSuccess, onError) {
    Sdk.allResourcesSerializationData = {};
    Sdk.allResourcesSerializationData.onSuccess = onSuccess;
    Sdk.allResourcesSerializationData.onError = onError;
    Sdk.allResourcesSerializationData.resources = [];
    Sdk.currentData.rows.forEach(function (row) {
        if (row.homeorganization != Sdk.UserInfo.OrganizationId || Sdk.importAllSettings.includeHome)
        {
            Sdk.allResourcesSerializationData.resources.push(row);
        }
    });
    Sdk.allResourcesSerializationData.currentResource = 0;
    Sdk.internalDeSerializeAllResources();
}

Sdk.serializeWebResource = function (resourceId, settings, onSuccess, onError) {

    var parameters = {};
    var webresource = {};
    webresource.webresourceid = resourceId;//"00000001-0000-0000-0000-000000000000";
    parameters.WebResource = webresource;
    parameters.Settings = "test";

    var uri = "/ita_serializeconfigurationdata";
    var result = Sdk.request("POST", uri, parameters, false, 1000) // Adding sample data so we can query against it.
        .then(function (request) {
            onSuccess();
        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.deSerializeWebResource = function (resourceId, settings, onSuccess, onError) {


    var parameters = {};
    var webresource = {};
    webresource.webresourceid = resourceId;//"00000001-0000-0000-0000-000000000000";
    parameters.WebResource = webresource;
    parameters.Settings = settings;

    var uri = "/ita_deserializeconfigurationdata";
    var result = Sdk.request("POST", uri, parameters, false, 1000) // Adding sample data so we can query against it.
        .then(function (request) {
            onSuccess();
        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.createProgressDialog = function (progressDialogControlName, progressBarControlName)
{
    Sdk.progressDialogControl = progressDialogControlName;
    Sdk.progressBarControl = progressBarControlName;
    $("#" + progressDialogControlName).dialog({
        height: 60,
        dialogClass: 'noTitleDialog',
        modal: true,
        autoOpen: false,
        open: function (event, ui) {
            $("#" + Sdk.progressDialogControl).css('overflow', 'hidden'); //this line does the actual hiding
        }
    });
}

Sdk.createWebResourceDialog = function(controlName)
{
    Sdk.webResourceDialogControl = controlName;
    $("#" + controlName).dialog({
        height: 540,
        width: 800,
        title: "Configuration Data",
        modal: true,
        autoOpen: false,
        buttons: [
            {
                text: "Save",

                click: function () {
                    Sdk.showProgressBar();
                    if (Sdk.currentRow != null) {
                        Sdk.updateRow(Sdk.currentRow);
                        Sdk.updateWebResource(Sdk.currentRow, Sdk.resourceOnSaveSuccess, Sdk.onError);
                    } else {
                        Sdk.currentRow = {};
                        Sdk.updateRow(Sdk.currentRow);
                        Sdk.createWebResource(Sdk.currentRow, Sdk.resourceOnCreateSuccess, Sdk.onError);
                    }
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


Sdk.runFetchXml = function (entitySet, fetchXml, maxPageSize, onSuccess, onError) {

    var uri = "/"+entitySet+"?fetchXml="+fetchXml;
    var result = Sdk.request("GET", uri, null, false, maxPageSize) // Adding sample data so we can query against it.
        .then(function (request) {
            debugger;
            var str = request.response.replace(/_x002e_/g, ""); 
            var data = JSON.parse(str).value;
            onSuccess(data);
        })
        .catch(function (error) {
            onError(error.message);
        });
}

Sdk.loadMetaData = function()
{
    Sdk.showProgressBar();
    Sdk.runFetchXml("sdkmessagefilters", sdkMessagesFetchXml, 5000,
        function (data) { Sdk.MessageFilters = data; Sdk.hideProgressBar(); },
        function (msg) { alert(msg); Sdk.hideProgressBar(); }
    );
}

Sdk.LoadPluginRegistrationData = function () {
    Sdk.showProgressBar();
    Sdk.runFetchXml("sdkmessagefilters", sdkMessagesFetchXml, 5000,
        function (data) { Sdk.MessageFilters = data; Sdk.hideProgressBar(); },
        function (msg) { alert(msg); Sdk.hideProgressBar(); }
    );
}

Sdk.createImportAllDialog = function (controlName) {
    Sdk.importAllDialogControl = controlName;
    $("#" + controlName).dialog({
        height: 200,
        width: 600,
        title: "Import All",
        modal: true,
        autoOpen: false,
        buttons: [
            {
                text: "Import",

                click: function () {
                    $(this).dialog("close");
                    Sdk.importAllSettings = {};
                    Sdk.importAllSettings.includeHome = $("#import_includehome").prop('checked');
                    Sdk.importAllSettings.alwaysUpdate = $("#import_alwaysupdate").prop('checked');

                    Sdk.showProgressBar();
                    Sdk.publishAll(
                        function () {
                            Sdk.deSerializeAllResources(
                                function () {
                                    Sdk.publishAll(Sdk.resourceOnSaveSuccess, Sdk.resourceOnSaveError);
                                },
                                Sdk.resourceOnSaveError
                            );
                        }, Sdk.resourceOnSaveError);
                }
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

Sdk.onError = function (error) {
    alert(error);
};


Sdk.showProgressBar = function () {

    $("#" + Sdk.progressDialogControl).dialog('open');
    $("#" + Sdk.progressBarControl).progressbar({ value: false });
}

Sdk.hideProgressBar = function () {

    $("#" + Sdk.progressBarControl).progressbar("destroy");
    $("#" + Sdk.progressDialogControl).dialog('close');
}


Sdk.resourceOnSaveSuccess = function () {

    location.reload();
}

Sdk.resourceOnCreateSuccess = function () {
    location.reload();
}

Sdk.resourceOnSaveError = function (message) {
    alert(message);
    Sdk.hideProgressBar();
}

Sdk.newResource = function () {
    Sdk.currentRow = null;
    Sdk.openResourceDialog();
}
Sdk.updateResource = function (webResourceId) {
    Sdk.currentRow = Sdk.getLoadedResourceById(webResourceId);
    Sdk.openResourceDialog();
}

Sdk.openResourceDialog = function () {

    $("#data_description").val(Sdk.currentRow != null ? Sdk.currentRow.description : "");
    $("#data_displayname").val(Sdk.currentRow != null ? Sdk.currentRow.displayname : "");
    $("#data_order").val(Sdk.currentRow != null ? Sdk.currentRow.order : "");
    $("#data_createonly").prop('checked', Sdk.currentRow != null ? Sdk.currentRow.createonly : false);
    
    $("#data_fetchxml").val(Sdk.currentRow != null ? Sdk.currentRow.fetchxml : "");
    $("#data_lookupfield").val(Sdk.currentRow != null ? Sdk.currentRow.lookupfield : "");

    $("#data_resourceurl").attr("href", Sdk.currentRow != null ? "../../../main.aspx?_CreateFromType=7100&etc=9333&id=%7b" + Sdk.currentRow.webresourceid + "%7d&pagetype=webresourceedit" : "");
    $("#data_resourceurl").text(Sdk.currentRow != null ? Sdk.currentRow.resourcename : "");


    $("#" + Sdk.webResourceDialogControl).dialog('open');
}

Sdk.updateRow = function (dialogRow) {

    dialogRow.description = $("#data_description").val();
    dialogRow.displayname = $("#data_displayname").val();
    dialogRow.order = $("#data_order").val();
    dialogRow.createonly = $("#data_createonly").prop('checked');
    dialogRow.fetchxml = $("#data_fetchxml").val();
    dialogRow.lookupfield = $("#data_lookupfield").val();
}

Sdk.serializeAll = function () {
    Sdk.showProgressBar();
    Sdk.serializeAllResources(
        function () {
            Sdk.publishAll(Sdk.resourceOnSaveSuccess, Sdk.resourceOnSaveError);
        },
        Sdk.resourceOnSaveError);
}

Sdk.importAll = function () {
    $("#" + Sdk.importAllDialogControl).dialog('open');
    

}

Sdk.confirm = function (message) {
    return confirm(message);
}