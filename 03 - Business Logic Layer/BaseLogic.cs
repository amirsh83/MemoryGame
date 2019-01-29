using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AwesomeMemory
{
   public class BaseLogic : IDisposable
    {
        protected AwesomeMemoryGameEntities DB = new AwesomeMemoryGameEntities();

        public void Dispose()
        {
            DB.Dispose();
        }
    }
}
