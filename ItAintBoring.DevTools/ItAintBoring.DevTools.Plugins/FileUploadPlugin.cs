using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Runtime.Serialization;
using System.Linq;
using Microsoft.Crm.Sdk.Messages;

namespace ItAintBoring.DevTools.Plugins
{
    public class FileUploadPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)
                serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            
            try
            {
                string parameters = context.InputParameters.Contains("parameters") ? (string)context.InputParameters["parameters"] : null;
                string command = context.InputParameters.Contains("command") ? (string)context.InputParameters["command"] : null;
                if (command == "uploadfile")
                {
                    var file = Common.FileDataFromString(parameters);
                    int i = file.fileData.IndexOf("base64,");
                    if(i >= 0)
                    {
                         
                        file.fileData = file.fileData.Substring(i + 7);
                        //file.fileData = Encoding.UTF8.GetString(base64String);
                        
                        Common.InstallAssembly(service, file.fileData, file.assemblyId);
                    }
                    Entity pluginAssembly = new Entity("pluginassembly");

                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}