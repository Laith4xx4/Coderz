using System.ComponentModel.DataAnnotations;

namespace BlogsApi.Models
{
    public class Class
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }    
    }
}
