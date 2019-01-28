using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AwesomeMemory
{
    public class GameResultModel
    {
        public int gameresultid { get; set; }
        public int userid { get; set; }
        public string fullname { get; set; }
        public string username { get; set; }
        public DateTime dateplayed { get; set; }
        public int gamesessionlength { get; set; }
        public int stepstaken { get; set; }
    }
}
