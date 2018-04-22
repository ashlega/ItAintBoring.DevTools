using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using Microsoft.Xrm.Sdk;
using ItAintBoring.DevTools.Plugins;

namespace ItAintBoring.WebApp.Areas.Dynamics
{
    public class Common
    {
        static public IEnumerable<TypeName> FindAssignableTypes(string base64Data, Type baseType)
        {
            //TODO
            //Load into a separate domain
            //and call unload on the domain?
            IEnumerable<TypeName> result = null;
            var fileData = Convert.FromBase64String(base64Data);
            try
            {
                var assembly = System.Reflection.Assembly.Load(fileData);
            
                var typesInAsm = assembly.GetTypes();
                result = typesInAsm.Where(t => baseType.IsAssignableFrom(t)).Select(x => new TypeName()
                {
                     FullName = x.FullName,
                     Name = x.Name
                });
            }
            catch (ReflectionTypeLoadException ex)
            {
                string error = ex.Message; ;
                foreach (var item in ex.LoaderExceptions)
                {
                    error += item.Message + ";";
                }
                throw new Exception(error);
            }
            return result;

            /*
            
            var ad = AppDomain.CreateDomain("Test");
            AppDomain.CurrentDomain.AssemblyResolve += new ResolveEventHandler(AssembleResolver);
            base64Data = base64Data; 
            
            var assembly = ad.Load(fileData);

            AppDomain.Unload(ad);
            */

        }

        /*
        static Assembly AssembleResolver(object source, ResolveEventArgs e)
        {
            return null;
            return Assembly.Load(e.Name);
        }
        */

    }
}