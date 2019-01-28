using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;


namespace AwesomeMemory
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api")]
  public class MessageApiController : ApiController
    { 
  private MessageLogic logic = new MessageLogic();

    [HttpPost]
    [Route("contact")]
    public HttpResponseMessage AddMessage(MessageModel messagemodel)
    {
        try
        {
          
            if (!ModelState.IsValid)
            {
                List<PropErrors> errorList = ErrorExtractor.ExtractErrors(ModelState);
                return Request.CreateResponse(HttpStatusCode.BadRequest, errorList);
            }
            MessageModel message = logic.AddMessage(messagemodel);
            return Request.CreateResponse(HttpStatusCode.Created, message);
        }
        catch (Exception ex)
        {
            return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); 
        }

    }


    [HttpGet]
    [Route("contact/{id}")]
    public HttpResponseMessage GetOneMessage(int id)
    {
        try
        {
         
            MessageModel message = logic.GetOneMessage(id);
            return Request.CreateResponse(HttpStatusCode.OK, message);
        }
        catch (Exception ex)
        {
            return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); 
        }

    }

}

}

