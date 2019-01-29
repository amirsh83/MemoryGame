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
    public class FeedbackApiController : ApiController
    {

        private FeedbackLogic logic = new FeedbackLogic();
        private UserLogic userlogic = new UserLogic();


        [HttpGet]
        [Route("feedbacks")]
        public HttpResponseMessage GetAllFeedback()
        {
            try
            {
              
                List<UserFeedbackModel> feedbacks = logic.GetAllFeedbacks();
                foreach (var item in feedbacks)
                {
                   
                    item.username = userlogic.GetUserName(item.userid);
               
                }

                return Request.CreateResponse(HttpStatusCode.OK, feedbacks);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); 
            }
        }


        [HttpPost]
        [Route("feedback")]
        public HttpResponseMessage AddFeedback(UserFeedbackModel feedbackmodel)
        {
            try
            {
              
                if (!ModelState.IsValid)
                {
                    List<PropErrors> errorList = ErrorExtractor.ExtractErrors(ModelState);
                    return Request.CreateResponse(HttpStatusCode.BadRequest, errorList);
                }
                UserFeedbackModel feedback = logic.AddFeedback(feedbackmodel);
                feedback.username = userlogic.GetUserName(feedback.userid);
               
                return Request.CreateResponse(HttpStatusCode.Created, feedback);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); 
            }

        }


        [HttpGet]
        [Route("feedbacks/{id}")]
        public HttpResponseMessage GetOneFeedback(int id)
        {
            try
            {
           
                UserFeedbackModel feedback = logic.GetOneFeedback(id);
                feedback.username = userlogic.GetUserName(feedback.userid);
                return Request.CreateResponse(HttpStatusCode.OK, feedback);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); 
            }

        }
    }
}
