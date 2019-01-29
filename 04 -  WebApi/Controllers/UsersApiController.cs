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
    public class UsersApiController : ApiController
    {
        private UserLogic logic = new UserLogic();

        [HttpGet]
        [Route("users")]
        public HttpResponseMessage GetAllUsers()
        {
            try
            {
                List<UserModel> users = logic.GetAllUsers();
                return Request.CreateResponse(HttpStatusCode.OK, users);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex);
            }
        }



        [HttpPost]
        [Route("users")]
        public HttpResponseMessage AddUser(UserModel userModel)
        {
            try
            {
              
                if (!ModelState.IsValid)
                {
                    List<PropErrors> errorList = ErrorExtractor.ExtractErrors(ModelState);
                    return Request.CreateResponse(HttpStatusCode.BadRequest, errorList);
                }
                if (logic.IsUsernameExist(userModel.username) == false)
                {
                    UserModel user = logic.AddUser(userModel);
                    return Request.CreateResponse(HttpStatusCode.Created, user);
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest, "user name taken");
                }
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); // for DEV env
            }

        }


        [HttpGet]
        [Route("users/{username}")]
        public HttpResponseMessage isuserexist(string username)
        {
            try
            {
                // int a = 0, b = 1 / a;   // causing a crash - cannot devide by zero.
                bool user = logic.IsUsernameExist(username);
                return Request.CreateResponse(HttpStatusCode.OK, user);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); // for DEV env
            }

        }



        [HttpGet]
        [Route("login/{username}/{password}")]
        public HttpResponseMessage isvaliduser(string username, string password)
        {
            try
            {
                // int a = 0, b = 1 / a;   // causing a crash - cannot devide by zero.
                bool user = logic.IsValidUser(username, password);
                return Request.CreateResponse(HttpStatusCode.OK, user);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); // for DEV env
            }

        }

        [HttpGet]
        [Route("uid/{username}")]
        public HttpResponseMessage uid(string username)
        {
            try
            {
                // int a = 0, b = 1 / a;   // causing a crash - cannot devide by zero.
                string uid = logic.GetUID(username);
                return Request.CreateResponse(HttpStatusCode.OK, uid);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); // for DEV env
            }

        }

        [HttpGet]
        [Route("users/{id}")]
        public HttpResponseMessage GetOneUser(int id)
        {
            try
            {
                // int a = 0, b = 1 / a;   // causing a crash - cannot devide by zero.
                UserModel user = logic.GetOneUser(id);
                return Request.CreateResponse(HttpStatusCode.OK, user);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex); // for DEV env
            }

        }

    }
}


