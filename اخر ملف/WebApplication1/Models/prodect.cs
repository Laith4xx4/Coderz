using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
   
public class Product
{
        // هذا سيكون العمود الرئيسي (Primary Key) في الجدول
        // [Key] هو Data Annotation يحدد المفتاح الأساسي
        [Key]
        public int ProductId { get; set; }

        // [Required] يعني أن هذا العمود لا يمكن أن يكون فارغًا
        [Required]
        public string? Name { get; set; }

    public decimal Price { get; set; }

    public int Quantity { get; set; }
}
}
