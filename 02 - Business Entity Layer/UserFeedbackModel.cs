using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AwesomeMemory
{
  public  class UserFeedbackModel
    {
        public int feedbackid { get; set; }
        public int userid { get; set; }
        public string username { get; set; }
        public DateTime feedbackdate { get; set; } 
        [Required(ErrorMessage = "missing feedback text.")]
        public string feedbacktext { get; set; }
    }
}
