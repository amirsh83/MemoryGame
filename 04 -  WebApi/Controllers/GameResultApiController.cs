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
    public class GameResultApiController : ApiController
    {
        private GameResultLogic logic = new GameResultLogic();
        private UserLogic userlogic = new UserLogic();

        [HttpGet]
        [Route("results")]
        public HttpResponseMessage GetAllResults()
        {
            try
            {
              
                List<GameResultModel> results = logic.GetAllResults();
                foreach (var item in results)
                {
                    item.fullname =  userlogic.GetFullName(item.userid);
                    item.username = userlogic.GetUserName(item.userid);
            
                }
             
                return Request.CreateResponse(HttpStatusCode.OK, results);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); 
            }
        }


        [HttpPost]
        [Route("results")]
        public HttpResponseMessage AddGameResult(GameResultModel gameresultmodel)
        {
            try
            {
               
                if (!ModelState.IsValid)
                {
                    List<PropErrors> errorList = ErrorExtractor.ExtractErrors(ModelState);
                    return Request.CreateResponse(HttpStatusCode.BadRequest, errorList);
                }
                GameResultModel result = logic.AddResult(gameresultmodel);
                result.fullname = userlogic.GetFullName(result.userid);
                result.username = userlogic.GetUserName(result.userid);
       
                
                return Request.CreateResponse(HttpStatusCode.Created, result);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); 
            }

        }


        [HttpGet]
        [Route("results/{id}")]
        public HttpResponseMessage GetOneResult(int id)
        {
            try
            {

                GameResultModel result = logic.GetOneResult(id);
                result.fullname = userlogic.GetFullName(result.userid);
                result.username = userlogic.GetUserName(result.userid);
           
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); 
            }

        }
    }
}

