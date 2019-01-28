using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AwesomeMemory
{
   public class MessageLogic : BaseLogic
    {
        public MessageModel AddMessage(MessageModel messageModel)
        {
            Message message = new Message
            {

                DateAdded = DateTime.Now,
                Phone = messageModel.phone,
                Email = messageModel.email,
                Message1 = messageModel.message
            };

            DB.Messages.Add(message);
            DB.SaveChanges();



            messageModel.messageid= message.MessageID; 

       

            return GetOneMessage(message.MessageID);
        }

        public MessageModel GetOneMessage(int id)
        {
            return DB.Messages
                .Where(m => m.MessageID == id)
                .Select(m => new MessageModel
                {
                    messageid = m.MessageID,
                    dateadded = m.DateAdded,
                    phone = m.Phone,
                    email = m.Email,
                    message = m.Message1
                }).SingleOrDefault();
        }


    }


}

