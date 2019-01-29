using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace AwesomeMemory
{
   public class MessageModel
    {
        public int messageid { get; set; }
        public DateTime dateadded { get; set; }
        public string phone { get; set; }
        public string email { get; set; }
        [Required(ErrorMessage = "missing  message text.")]
        public string message { get; set; }
    }
}
