

namespace WarehouseApp.Domain.Entities;

public class Message
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
    public string SenderId { get; set; } = string.Empty;
    public AppUser Sender { get; set; } = null!;
    public string ReceiverId { get; set; } = string.Empty;
    public AppUser Receiver { get; set; } = null!;
}
