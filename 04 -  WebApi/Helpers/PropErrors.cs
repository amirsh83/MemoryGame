using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AwesomeMemory
{
    public class PropErrors
    {
        public string property { get; set; }

        public List<string> Errors { get; set; } = new List<string>();
    }
}