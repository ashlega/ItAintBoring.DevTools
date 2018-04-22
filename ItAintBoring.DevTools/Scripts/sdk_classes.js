"use strict";
var Sdk = window.Sdk || {};

Sdk.Constants = {};

Sdk.Constants.ExecutionStage = {
    PRE_OPERATION: 0,
    POST_OPERATION: 1,
    PRE_VALIDATION: 2
}

Sdk.Constants.ExecutionMode = {
    ASYNCHRONOUS: 0,
    SYNCHRONOUS: 1
}

Sdk.Constants.IsolationModes = {
    SANDBOX: { value: 0, text: 'Sandbox' },
    NONE: { value: 1, text: 'None' },
}

Sdk.Constants.Locations = {
    
    DATABASE: { value: 0, text: 'Database' },
    GAC: { value: 1, text: 'GAC' },
    DISK: { value: 2, text: 'Disk' }
}

//Sdk.Constants.LoactionOptions

Sdk.AssemblyDetails = function (id, name, version, isolationMode, location, createdOn, modifiedOn, plugins) {
    this.Id = id;
    this.Name = name;
    this.Version = version;
    this.IsolationMode = isolationMode;
    this.Location = location;
    this.Plugins = plugins;
    this.ModifiedOn = modifiedOn;
    this.CreatedOn = createdOn;
}

Sdk.PluginDetails = function (id, name, assembly, typeName, createdOn, modifiedOn, steps) {
    this.Id = id;
    this.Assembly = assembly;
    this.Name = name;
    this.TypeName = typeName;
    this.CreatedOn = createdOn;
    this.ModifiedOn = modifiedOn;
    this.Steps = steps;
}

Sdk.StepDetails = function (id, name, plugin, message, entity, attributes, userName, executionOrder, description, executionStage, executionMode, deleteAsyncOperation, unsecureConfiguration, secureConfiguration, rank ) {
    this.Id = id;
    this.Name = name;
    this.Plugin = plugin;
    this.Message = message;
    this.Entity = entity;
    this.Attributes = attributes;
    this.UserName = userName;
    this.ExecutionOrder = executionOrder;
    this.Description = description;
    this.ExecutionStage = executionStage;
    this.ExecutionMode = executionMode;
    this.DeleteAsyncOperation = deleteAsyncOperation;
    this.UnSecureConfiguration = unSecureConfiguration;
    this.SecureConfiguration = secureConfiguration;
    this.Rank = rank;
}

Sdk.StepDetails = function (name, plugin) {
    this.Name = name;
    this.Plugin = plugin;
}


Sdk.MakeId = function (len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

Sdk.createSampleData = function () {
    var data = {
        Name: "Assemblies",
        Id: "1",
        Children: []
    };
    data.Children.push(Sdk.createSampleAssembly());
    data.Children.push(Sdk.createSampleAssembly());
    data.Children.push(Sdk.createSampleAssembly());
    data.Children.push(Sdk.createSampleAssembly());
    return data;
}

Sdk.createSampleAssembly = function () {
    var data = new Sdk.AssemblyDetails(Sdk.MakeId(5), Sdk.MakeId(30) + ".Assembly", "2.0", Sdk.Constants.IsolationModes.SANDBOX.value, Sdk.Constants.Locations.DATABASE.value, new Date(), new Date(), []);
    data.Plugins.push(Sdk.createSamplePlugin(data));
    data.Plugins.push(Sdk.createSamplePlugin(data));
    data.Children = data.Plugins;
    return data;
}

Sdk.createSamplePlugin = function (assembly) {
    var data = new Sdk.PluginDetails(Sdk.MakeId(5), Sdk.MakeId(7) + ".Plugin", assembly, assembly.Name + "." + Sdk.MakeId(5), new Date(), new Date(), []);
    data.Steps.push(Sdk.createSampleStep(data));
    data.Steps.push(Sdk.createSampleStep(data));
    data.Children = data.Steps;
    return data;
}

Sdk.createSampleStep = function (plugin) {
    var data = new Sdk.StepDetails(Sdk.MakeId(5), plugin.Name + " " + Sdk.MakeId(7), plugin, "Create", "account", "accountid,name", null, 1, "Test " + Sdk.MakeId(10), Sdk.Constants.ExecutionStage.PRE_OPERATION, Sdk.Constants.ExecutionMode.ASYNCHRONOUS, true, "Test Unsecure", "Test Secure");
    return data;
}


/*
Sdk.PluginDetails.prototype.Name = function () {
    return this.name;
};*/