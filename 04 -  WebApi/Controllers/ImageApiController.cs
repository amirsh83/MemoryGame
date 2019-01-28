using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace AwesomeMemory.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api")]
    public class ImageApiController : ApiController
    {

        private ImageLogic imagelogic = new ImageLogic();
   


        [HttpGet]
        [Route("images")]
        public HttpResponseMessage GetAllImages()
        {
            try
            {
                List<ImageModel> images = imagelogic.GetAllImagess();
                return Request.CreateResponse(HttpStatusCode.OK, images);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex);
            }
        }


       

        [HttpGet]
        [Route("images/{id}")]
        public HttpResponseMessage GetOneImage(int id)
        {
            try
            {
       
                ImageModel image = imagelogic.GetOneImage(id);
                return Request.CreateResponse(HttpStatusCode.OK, image);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex);
            }

        }

    }
}