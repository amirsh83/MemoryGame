using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AwesomeMemory
{
    public class FeedbackLogic : BaseLogic
    {
       
        public List<UserFeedbackModel> GetAllFeedbacks()
        {
            return DB.UsersFeedbacks.Select(f => new UserFeedbackModel
            {
                feedbackid = f.FeedbackID,
                userid = f.UserID,
                feedbackdate = f.FeedbackDate,
                feedbacktext = f.FeedbackText
            }).ToList();
        }



        public UserFeedbackModel AddFeedback(UserFeedbackModel feedbackModel)
        {
            UsersFeedback feedback = new UsersFeedback
            {
                UserID = feedbackModel.userid,
                FeedbackDate = DateTime.Now,
                FeedbackText = feedbackModel.feedbacktext
            };

            DB.UsersFeedbacks.Add(feedback);
            DB.SaveChanges();

     

            feedbackModel.feedbackid = feedback.FeedbackID; 

            return GetOneFeedback(feedback.FeedbackID);
        }

        public UserFeedbackModel GetOneFeedback(int id)
        {
            return DB.UsersFeedbacks
                .Where(f => f.FeedbackID == id)
                .Select(f => new UserFeedbackModel
                {
                    feedbackid = f.FeedbackID,
                    userid = f.UserID,
                  feedbackdate = f.FeedbackDate,
                    feedbacktext = f.FeedbackText
                }).SingleOrDefault();
        }


    }


}

