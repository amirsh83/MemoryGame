using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AwesomeMemory
{
    public class GameResultLogic : BaseLogic
    {

      UserLogic userlogic = new UserLogic();
        User user = new User();
        public List<GameResultModel> GetAllResults()
        {
        
      
          return DB.GameResults.Select(r => new GameResultModel

          {
              gameresultid = r.GameResultID,
              userid = r.UserID,
              dateplayed = r.DatePlayed,
              gamesessionlength = r.GameSessionLength,
              stepstaken = r.StepsTaken
          }).ToList();
           
        }



        public GameResultModel AddResult(GameResultModel gameResultModel)
        {
            GameResult result = new GameResult
            {
                UserID = gameResultModel.userid,
                DatePlayed = DateTime.Now,
                GameSessionLength = gameResultModel.gamesessionlength,
                StepsTaken = gameResultModel.stepstaken
            };

            DB.GameResults.Add(result);
            DB.SaveChanges();



            gameResultModel.gameresultid = result.GameResultID; 

        

            return GetOneResult(result.GameResultID);
        }

        public GameResultModel GetOneResult(int id)
        {
            return DB.GameResults
                .Where(r => r.GameResultID == id)
                .Select(r => new GameResultModel
                {
                    gameresultid = r.GameResultID,
                    userid = r.UserID,              
                    dateplayed = r.DatePlayed,
                    gamesessionlength = r.GameSessionLength,
                    stepstaken = r.StepsTaken
                }).SingleOrDefault();
        }


    }


}
