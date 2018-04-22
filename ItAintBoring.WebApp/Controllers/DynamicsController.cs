using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using ItAintBoring.DevTools.Plugins;

namespace ItAintBoring.WebApp.Controllers
{
    public class DynamicsController : Controller
    {
        // GET: Dynamics
        [System.Web.Mvc.HttpPost]
        [System.Web.Mvc.Route("Dynamics/GetPluginTypes")]
        public ActionResult GetPluginTypes([FromBody] string parameters)
        {
            string result = "";

            try
            {
                var pluginTypeList = Areas.Dynamics.Common.FindAssignableTypes(parameters, typeof(Microsoft.Xrm.Sdk.IPlugin));
                var activityTypeList = Areas.Dynamics.Common.FindAssignableTypes(parameters, typeof(System.Activities.CodeActivity));
                TypeList tl = new DevTools.Plugins.TypeList();
                tl.codeActivityTypes = new List<TypeName>(activityTypeList);
                tl.pluginTypes = new List<TypeName>(pluginTypeList);
                result = Common.SerializeObject<TypeList>(tl);
            }
            catch(Exception ex)
            {
                result = "Error: " + ex.Message;
            }
            return Content(result);
        }
    }
}