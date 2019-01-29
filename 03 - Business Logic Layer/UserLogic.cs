using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AwesomeMemory
{
    public class UserLogic : BaseLogic
    {

        public List<UserModel> GetAllUsers()
        {
            var query = from u in DB.Users
                        select new UserModel
                        {
                            userid = u.UserID,
                            fullname = u.FullName,
                            username = u.UserName,
                            password = u.Password,
                            email = u.Email,
                            dateofbirth = u.DateOfBirth
                        };

            return query.ToList();
        }



        public UserModel AddUser(UserModel userModel)
        {
            // login procees - should be implimented here ?

            // open issue - need to validate user NOT exist in DB already!
            User user = new User
            {

                FullName = userModel.fullname,
                UserName = userModel.username,
                Password = userModel.password,
                Email = userModel.email,
                DateOfBirth = userModel.dateofbirth
            };

            DB.Users.Add(user);
            DB.SaveChanges();

            userModel.userid = user.UserID;
            return GetOneUser(user.UserID);
        }

        public UserModel GetOneUser(int id)
        {
            return DB.Users
                .Where(u => u.UserID == id)
                .Select(u => new UserModel
                {
                    userid = u.UserID,
                    fullname = u.FullName,
                    username = u.UserName,
                    password = u.Password,
                    email = u.Email,
                    dateofbirth = u.DateOfBirth
                }).SingleOrDefault();
        }

 

        // validdate user against DB.
        public bool IsValidUser(string username, string password)
        {
            if (DB.Users
                  .Where(u => u.UserName == username && u.Password == password)
                 .SingleOrDefault() != null)
                return true;
            else
                return false;
        }


        // getting user id from db
        public string GetUID(string username)
        {
            int id;
            string uid = "";
            foreach (var item in DB.Users)
            {
                if (item.UserName.ToLower() == username.ToLower())
                {

                    id = item.UserID;
                    uid = Convert.ToString(id);
                    
                }
            }
          
            return uid;
        }


        // validating user name exist in DB
        public bool IsUsernameExist(string username)
        {
            if (DB.Users
                  .Where(u => u.UserName == username)
                 .SingleOrDefault() != null)
                return true;
            else
                return false;
        }


        //  get full name
        public string GetFullName(int id)
        {
            string fullname = "";
            foreach (var item in DB.Users)
            {
                if (item.UserID == id)
                {

                    fullname = item.FullName;
                }    
            }
            return fullname;
        }


        // get user name
        public string GetUserName(int id)
        {
            string username = "";
            foreach (var item in DB.Users)
            {
                if (item.UserID == id)
                {

                    username = item.UserName;
                }
            }
            return username;
        }




    }

}
