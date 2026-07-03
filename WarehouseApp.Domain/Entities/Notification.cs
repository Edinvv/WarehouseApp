

using WarehouseApp.Domain.Enums;

namespace WarehouseApp.Domain.Entities;

    public class Notification
    {
        public Guid Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
   
        public NotificationType Type { get; set; }
        public string UserId { get; set; } = string.Empty;
        public AppUser User { get; set; } = null!;

    }
