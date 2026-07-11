using Microsoft.AspNetCore.Identity;


namespace WarehouseApp.Domain.Entities;

public class AppUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

   
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();

    
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
