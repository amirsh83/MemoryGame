using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AwesomeMemory
{
  public  class helper
    {


        // date of birth custom attribute. takes min, max age.
        public class DateOfBirthAttribute : ValidationAttribute
        {
            public int MinAge { get; set; }
            public int MaxAge { get; set; }
        

            public override bool IsValid(object value)
            {
                if (value == null)
                    return true;

                var val = (DateTime)value;

                if (val.AddYears(MinAge) > DateTime.Now)
                    return false;

                return (val.AddYears(MaxAge) > DateTime.Now);
            }
        }


        private DateTime mindate = new DateTime(1930, 1, 1);

        public bool isValidBirthDate(DateTime d)
        {
            if (DateTime.Now > d || d > mindate || DateTime.Compare(DateTime.Now, d) > 3)
            {
                return true;
            }
            else
            {
                return false;
            }


        }


        // email vlidation regex
        protected Regex regex = new Regex(@"^(?("")("".+?(?<!\\)""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))" +
               @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-0-9a-z]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$");



        public bool isvalidEmail(string email)
        {
            try
            {
                return regex.IsMatch(email);

            }
            catch (Exception ex)
            {
                Console.WriteLine("do somthing with excetion" + ex);
                return false;
            }

        }


    }
}
