using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using System.Runtime.Serialization.Json;
using System.Runtime.Serialization;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Web;
using System.Net;
using System.Net.Http;


namespace ItAintBoring.DevTools.Plugins
{
    public class Common
    {

        public static FileData FileDataFromString(string data)
        {
            FileData result = null;
            using (MemoryStream ms = new MemoryStream())
            {
                StreamWriter sw = new StreamWriter(ms);
                sw.Write(data);
                sw.Flush();
                ms.Position = 0;
                DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(FileData));
                result = (FileData)serializer.ReadObject(ms);
            }
            return result;
        }

        public static T GetAttribute<T>(Entity entity, Entity image, string attributeName)
        {
            if (entity.Contains(attributeName)) return (T)entity[attributeName];
            else if (image != null && image.Contains(attributeName)) return (T)image[attributeName];
            else return default(T);
        }

        public static string SerializeObject<T>(T obj)
        {
            string result = null;
            var lateBoundSerializer = new DataContractJsonSerializer(typeof(T));
            using (System.IO.MemoryStream ms = new System.IO.MemoryStream())
            {
                lateBoundSerializer.WriteObject(ms, obj);
                ms.Flush();
                ms.Position = 0;
                System.IO.StreamReader sr = new System.IO.StreamReader(ms);
                result = sr.ReadToEnd();
            }
            return result;
        }

        public static T DeSerializeObject<T>(string data)
        {
            T result = default(T);
            using (System.IO.MemoryStream ms = new System.IO.MemoryStream())
            {
                var lateBoundSerializer = new DataContractJsonSerializer(typeof(T));
                
                System.IO.StreamWriter sw = new System.IO.StreamWriter(ms);
                sw.Write(data);
                sw.Flush();
                ms.Position = 0;
                result = (T)lateBoundSerializer.ReadObject(ms);
            }
            return result;
        }

        private static string configServiceUrl = null;
        static public string GetConfigServiceUrl(IOrganizationService service)
        {
            if (configServiceUrl == null)
            {
                var er = new OrganizationRequest("ita_dtconfiguration");
                
                OrganizationResponse response = service.Execute(er);
                if(response.Results.Contains("ITAServiceUrl"))
                {
                    configServiceUrl = (string)response.Results["ITAServiceUrl"];
                }
            }
            return configServiceUrl;

        }

        static public TypeList GetPluginTypes(IOrganizationService service, string base64Data)
        {
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(GetConfigServiceUrl(service));
                
                var content = new System.Net.Http.StringContent("{\"parameters\": \"" + base64Data + "\"}");
                content.Headers.Remove("Content-Type");
                content.Headers.Add("Content-Type", "application/json");
                string postResult = null;
                Task.Run(async () =>
                {
                    try
                    {
                        HttpResponseMessage hrm = await client.PostAsync("/Dynamics/GetPluginTypes", content);
                        postResult = await hrm.Content.ReadAsStringAsync();
                    }
                    catch (Exception ex)
                    {
                        postResult = "Error: " + ex.Message;
                    }

                }).Wait();
                //TODO
                //ADD DESERIALIZATION
                //SEE WHAT THAT ERROR IS ABOUT
                if(postResult.IndexOf("Error:") < 0)
                {
                    return DeSerializeObject<TypeList>(postResult);
                }
                else
                {
                    throw new Exception(postResult);
                }
            }
        }

        static public void InstallAssembly(IOrganizationService service, string data, string assemblyId)
        {
           
            
            var fileData = Convert.FromBase64String(data);
            Entity pluginAssembly = new Entity("pluginassembly");
            //pluginAssembly.Id = Guid.Parse("918E82DE-FC80-4BE2-83E9-D78F6F115844");
            pluginAssembly["content"] = data;
            pluginAssembly["name"] = "Test";
            pluginAssembly.Id = service.Create(pluginAssembly);
            
            //var assembly = ad.Load(fileData);
            //throw new InvalidPluginExecutionException("test1");
            var types = GetPluginTypes(service, data);
            foreach (var t in types.pluginTypes)
            {
                Entity pluginType = new Entity("plugintype");
                pluginType["name"] = t.FullName;
                pluginType["typename"] = t.FullName;
                pluginType["friendlyname"] = t.FullName;
                pluginType["pluginassemblyid"] = pluginAssembly.ToEntityReference();
                service.Create(pluginType);
            }
            
        }


        /// <summary>
        /// Decompresses the string.
        /// </summary>
        /// <param name="compressedText">The compressed text.</param>
        /// <returns></returns>
        public static string DecompressString(string compressedText)
        {
            if (compressedText == null) return null;
            byte[] gZipBuffer = Convert.FromBase64String(compressedText);
            using (var memoryStream = new MemoryStream())
            {
                int dataLength = BitConverter.ToInt32(gZipBuffer, 0);
                memoryStream.Write(gZipBuffer, 4, gZipBuffer.Length - 4);

                var buffer = new byte[dataLength];

                memoryStream.Position = 0;
                using (var gZipStream = new GZipStream(memoryStream, CompressionMode.Decompress))
                {
                    gZipStream.Read(buffer, 0, buffer.Length);
                }

                return Encoding.UTF8.GetString(buffer);
            }

        }

        public static string CompressString(string text)
        {


            byte[] buffer = Encoding.UTF8.GetBytes(text);
            var memoryStream = new MemoryStream();
            using (var gZipStream = new GZipStream(memoryStream, CompressionMode.Compress, true))
            {
                gZipStream.Write(buffer, 0, buffer.Length);
            }

            memoryStream.Position = 0;

            var compressedData = new byte[memoryStream.Length];
            memoryStream.Read(compressedData, 0, compressedData.Length);

            var gZipBuffer = new byte[compressedData.Length + 4];
            Buffer.BlockCopy(compressedData, 0, gZipBuffer, 4, compressedData.Length);
            Buffer.BlockCopy(BitConverter.GetBytes(buffer.Length), 0, gZipBuffer, 0, 4);
            return Convert.ToBase64String(gZipBuffer);

        }

    }

    
}
