using DataAnnotationsExtensions;
using System;
using System.ComponentModel.DataAnnotations;
using Moviit.ComponentModel.DataAnnotations;
using static AwesomeMemory.helper;

namespace AwesomeMemory
{
    public class UserModel 
    {
      
        public int userid { get; set; }
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "missing full name.")]
        public string fullname { get; set; }
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "missing user name.")]
        public string username { get; set; }
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "missing password.")]
        public string password { get; set; }
        [Email(ErrorMessage = "Invalid Email Address")]
        public string email { get; set; }
        [DateOfBirth(MinAge = 3, MaxAge = 120, ErrorMessage = "Age not in range")]
        public DateTime? dateofbirth { get; set; }


    }
}
