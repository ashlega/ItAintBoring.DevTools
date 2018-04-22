using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Tooling.Connector;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System.Reflection;
using System.Web;
using System.Net;
using System.Net.Http;
using System.Activities;

namespace Test
{
    class Program
    {
        static CrmServiceClient crmSvc = null;
        static public string LoadFile()
        {
            var data = System.IO.File.ReadAllBytes("C:\\Work\\Projects\\Test\\test.dll");
            return Convert.ToBase64String(data);
        }

        static public IEnumerable<Type> FindDerivedTypes(Assembly assembly, Type baseType)
        {
            return assembly.GetTypes().Where(t => baseType.IsAssignableFrom(t));
        }

        static public void InstallAssembly(string data)
        {
            var fileData = Convert.FromBase64String(data);
            Entity pluginAssembly = new Entity("pluginassembly");
            pluginAssembly.Id = Guid.Parse("918E82DE-FC80-4BE2-83E9-D78F6F115844");
            pluginAssembly["content"] = data;
            pluginAssembly["name"] = "Test";
            pluginAssembly.Id = crmSvc.Create(pluginAssembly);

            var assembly = System.Reflection.Assembly.Load(fileData);
            var types = FindDerivedTypes(assembly, typeof(IPlugin));
            foreach (var t in types)
            {
                Entity pluginType = new Entity("plugintype");
                pluginType["name"] = t.FullName;
                pluginType["typename"] = t.FullName;
                pluginType["friendlyname"] = t.Name;
                pluginType["pluginassemblyid"] = pluginAssembly.ToEntityReference();
                pluginType["isworkflowactivity"] = 0;
                crmSvc.Create(pluginType);
            }

            types = FindDerivedTypes(assembly, typeof(CodeActivity));
            foreach (var t in types)
            {
                Entity pluginType = new Entity("plugintype");
                pluginType["name"] = t.FullName;
                pluginType["typename"] = t.FullName;
                pluginType["friendlyname"] = t.Name;
                pluginType["pluginassemblyid"] = pluginAssembly.ToEntityReference();
                pluginType["isworkflowactivity"] = 1;
                crmSvc.Create(pluginType);
            }



        }

        static void Main(string[] args)
        {
            var data = LoadFile();
            
            crmSvc = new CrmServiceClient("AuthType=AD;Url=http://win-fkqv0h91cr7/Service; Domain=CRM; Username=Administrator; Password=Admin234_");
            ItAintBoring.DevTools.Plugins.Common.InstallAssembly(crmSvc,data, Guid.Empty.ToString());
            QueryExpression qe = new QueryExpression("pluginassembly");
            qe.ColumnSet = new ColumnSet("name", "content");
            var result = crmSvc.RetrieveMultiple(qe);

            foreach (var r in result.Entities)
            {
                if (r.Contains("content"))
                {
                    try
                    {
                        var types = ItAintBoring.DevTools.Plugins.Common.GetPluginTypes(crmSvc, (string)r["content"]);
                        types = types;
                    }
                    catch (Exception ex)
                    {
                        ex = ex;
                    }
                   
                }

            }
            
        }
    }
}
