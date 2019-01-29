using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AwesomeMemory
{
 public   class ImageLogic : BaseLogic
    {

        public List<ImageModel> GetAllImagess()
        {
            return DB.Images.Select(i => new ImageModel
            {
                imageID = i.ImageID,
                imageName = i.ImageName
            }).ToList();
        }



        public ImageModel GetOneImage(int id)
        {
            return DB.Images
                .Where(i => i.ImageID == id)
                .Select(i => new ImageModel
                {
                    imageID = i.ImageID,
                    imageName = i.ImageName,
                }).SingleOrDefault();
        }


    }


}